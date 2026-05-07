const fs    = require('fs');
const path  = require('path');
const https = require('https');

const c = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));

const serviceNames = c.services.map(function (s) { return s.name; });
const serviceDescs = c.services.map(function (s) { return s.desc; });
const marquee = (serviceNames.join(' &nbsp;\xb7&nbsp; ') + ' &nbsp;\xb7&nbsp; ').repeat(2);

const contentEN = {
  nav: { whatWeDo: 'What', ourStory: 'Who', connect: 'Connect' },
  hero: {
    tagline:         'Built for Those Who Build',
    descHeader:      c.hero.descHeader,
    descBody:        c.hero.descBody,
    backgroundImage: c.hero.backgroundImage
  },
  mission: {
    quote: c.mission.line1 + '<br><em>' + c.mission.line2 + '</em>',
    sub:   c.mission.sub
  },
  whatIntro: {
    heading: c.whatIntro.heading,
    body:    c.whatIntro.body
  },
  services: {
    label:   'What We Do',
    tagline: 'Five disciplines.<br>One integrated approach.',
    names:   serviceNames,
    descs:   serviceDescs,
    marquee: marquee
  },
  about: {
    label:         'Who',
    heading:       c.about.heading1 + '<br><em>' + c.about.heading2 + '</em>',
    body:          c.about.body,
    quote:         c.about.quote,
    cite:          c.about.cite,
    portraitImage: c.about.portraitImage
  },
  process: {
    label:   'Engagement',
    heading: 'A structured path<br><em>to transformation.</em>',
    names:   ['Discovery &amp; Assessment', 'Strategy Architecture', 'Integrated Execution', 'Measurement &amp; Evolution'],
    details: [
      'We immerse ourselves in your business before proposing a single solution.',
      'A custom roadmap built around your market, your team, and your ambition.',
      'We work across all five disciplines simultaneously — no siloed thinking.',
      'Every engagement is monitored, refined, and held to results that matter.'
    ],
    pricing: 'Engagements from <em>$50,000</em> — structured to the specific needs of your business.'
  },
  contact: {
    label:           'Connect',
    heading:         c.contact.heading1 + '<br><em>' + c.contact.heading2 + '</em>',
    sub:             c.contact.sub,
    formTitle:       'We want to be part of your success.',
    firstName:       'First Name',    firstNamePh:    'First name',
    lastName:        'Last Name',     lastNamePh:     'Last name',
    email:           'Email',         emailPh:        'your@email.com',
    phone:           'Phone Number',  phonePh:        '+1 000 000 0000',
    company:         'Company',       companyPh:      'Company or brand name',
    aboutYourself:   'Tell us about yourself',
    aboutYourselfPh: 'Your background, experience, and what drives you.',
    aboutBusiness:   'Tell us about your business or product',
    aboutBusinessPh: 'Describe your business, your goals, and what you\'re looking to achieve.',
    submit:          'Send Enquiry'
  },
  footer: c.footer
};

// ── Translation via Claude API ─────────────────────────────────────────────

function callClaude(prompt) {
  return new Promise(function (resolve, reject) {
    var body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    });

    var options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    var req = https.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse API response: ' + e.message)); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function generateTranslations() {
  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('ℹ️  No ANTHROPIC_API_KEY set — skipping auto-translation (hardcoded translations will be used)');
    return Promise.resolve({});
  }

  // Strip image paths — no need to translate asset filenames
  var toTranslate = JSON.parse(JSON.stringify(contentEN));
  delete toTranslate.hero.backgroundImage;
  delete toTranslate.about.portraitImage;

  var prompt = [
    'You are a professional translator for a luxury business consulting firm.',
    'Translate the following JSON from English into Spanish (es), French (fr), Italian (it), and Arabic (ar).',
    '',
    'Rules:',
    '- Return ONLY valid JSON with exactly this structure: {"es":{...},"fr":{...},"it":{...},"ar":{...}}',
    '- Do NOT translate proper nouns: "Method Index", "Rabih Sater"',
    '- Preserve all HTML exactly as-is: <br>, <em>, </em>, &amp;, &copy;, <em>$50,000</em>, etc.',
    '- For Arabic, use Modern Standard Arabic appropriate for formal business contexts',
    '- Match the premium, authoritative tone of the original — this is a $50k+ consulting firm',
    '- Translate ALL string values including nav labels, form labels, and placeholders',
    '- Do not add, remove, or rename any JSON keys',
    '',
    'Content:',
    JSON.stringify(toTranslate, null, 2)
  ].join('\n');

  return callClaude(prompt).then(function (response) {
    if (!response.content || !response.content[0]) {
      console.warn('⚠️  Unexpected API response — skipping auto-translation');
      return {};
    }

    var text = response.content[0].text;
    var match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn('⚠️  Could not find JSON in translation response — skipping auto-translation');
      return {};
    }

    var translations = JSON.parse(match[0]);
    // Restore image paths from EN (they are not translated)
    ['es', 'fr', 'it', 'ar'].forEach(function (lang) {
      if (translations[lang] && translations[lang].hero)  translations[lang].hero.backgroundImage  = contentEN.hero.backgroundImage;
      if (translations[lang] && translations[lang].about) translations[lang].about.portraitImage   = contentEN.about.portraitImage;
    });

    console.log('✓ Auto-translations generated (ES, FR, IT, AR)');
    return translations;

  }).catch(function (err) {
    console.warn('⚠️  Translation API error:', err.message, '— skipping auto-translation');
    return {};
  });
}

// ── Write output ───────────────────────────────────────────────────────────

generateTranslations().then(function (translations) {
  var output = '// Auto-generated by build.js — do not edit directly\n';
  output += 'var CONTENT_EN = ' + JSON.stringify(contentEN, null, 2) + ';\n';
  if (translations.es) output += 'var CONTENT_ES = ' + JSON.stringify(translations.es, null, 2) + ';\n';
  if (translations.fr) output += 'var CONTENT_FR = ' + JSON.stringify(translations.fr, null, 2) + ';\n';
  if (translations.it) output += 'var CONTENT_IT = ' + JSON.stringify(translations.it, null, 2) + ';\n';
  if (translations.ar) output += 'var CONTENT_AR = ' + JSON.stringify(translations.ar, null, 2) + ';\n';

  fs.writeFileSync(path.join(__dirname, 'js', 'content.js'), output);
  console.log('✓ js/content.js written');
});
