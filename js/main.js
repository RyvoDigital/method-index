// Method Index — Main JS

// ── SMOOTH SCROLL (Lenis) ───────────────────────────────────────
(function initLenis() {
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}());

// ── SERVICE HOTSPOTS ────────────────────────────────────────────
function initServiceHotspots() {
  var hotspots    = document.querySelectorAll('.hotspot');
  var hoverCircles = document.querySelectorAll('.zone-hover');
  var items       = document.querySelectorAll('.service-item');
  if (!hotspots.length) return;

  var lockedZone = '1'; // zone locked by last click — panel reverts here on mouseleave

  function showPanel(zone) {
    items.forEach(function (item) {
      item.classList.toggle('active', item.dataset.service === zone);
    });
  }

  function showHoverCircle(zone) {
    hoverCircles.forEach(function (c) {
      c.classList.toggle('hovered', c.dataset.zone === zone);
    });
  }

  function hideHoverCircles() {
    hoverCircles.forEach(function (c) { c.classList.remove('hovered'); });
  }

  hotspots.forEach(function (h) {
    h.addEventListener('mouseenter', function () {
      showHoverCircle(h.dataset.zone);
      showPanel(h.dataset.zone);
    });
    h.addEventListener('mouseleave', function () {
      hideHoverCircles();
      showPanel(lockedZone); // revert to last clicked zone
    });
    h.addEventListener('click', function () {
      lockedZone = h.dataset.zone;
      showPanel(lockedZone);
    });
    h.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lockedZone = h.dataset.zone;
        showPanel(lockedZone);
      }
    });
    h.setAttribute('role', 'button');
    h.setAttribute('tabindex', '0');
    h.setAttribute('aria-label', 'Service zone ' + h.dataset.zone);
  });

  // Default: zone 1 active on load
  showPanel('1');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServiceHotspots);
} else {
  initServiceHotspots();
}

// ── SERVICES SHOWCASE ───────────────────────────────────────────
function initServicesShowcase() {
  var rows    = document.querySelectorAll('.showcase-row');
  var figures = document.querySelectorAll('.showcase__figure');
  if (!rows.length) return;

  function activateShowcase(index) {
    rows.forEach(function (r, i) { r.classList.toggle('active', i === index); });
    figures.forEach(function (f, i) { f.classList.toggle('active', i === index); });
  }

  rows.forEach(function (row, i) {
    row.addEventListener('mouseenter', function () { activateShowcase(i); });
    row.addEventListener('click',      function () { activateShowcase(i); });
  });

  activateShowcase(0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServicesShowcase);
} else {
  initServicesShowcase();
}

// ── NAV SCROLL PROGRESS ─────────────────────────────────────────
(function () {
  var nav = document.getElementById('nav');
  function updateScrollProgress() {
    var totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = totalScrollable > 0 ? window.scrollY / totalScrollable : 0;
    nav.style.setProperty('--scroll-progress', progress);
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();
}());

// ── HERO PARALLAX ───────────────────────────────────────────────
(function () {
  var heroBgImg = document.querySelector('.hero__bg-img');
  if (!heroBgImg) return;

  function onHeroScroll() {
    var scrollY = window.scrollY;
    var heroHeight = document.getElementById('hero').offsetHeight;
    if (scrollY > heroHeight) return;
    heroBgImg.style.transform = 'translateY(' + (scrollY * 0.35) + 'px)';
  }

  window.addEventListener('scroll', onHeroScroll, { passive: true });
}());

// ── PAGE LOAD SEQUENCE ──────────────────────────────────────────
function runLoadSequence() {
  var delays = [0, 150, 300, 420, 540, 650];
  var elements = document.querySelectorAll('.load-hidden');
  elements.forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add('loaded');
    }, delays[i] !== undefined ? delays[i] : i * 100);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runLoadSequence);
} else {
  runLoadSequence();
}


// ── SCROLL REVEALS ───────────────────────────────────────────────
function initScrollReveals() {
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (!revealEls.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
}
initScrollReveals();

// ── FORM HANDLER ──────────────────────────────────────────────
// Uses Web3Forms (free). Get your access key at web3forms.com and
// paste it into the hidden input in index.html.
var contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = contactForm.querySelector('.btn-submit span');
    var originalText = btn.textContent;

    btn.textContent = 'Sending…';
    contactForm.style.pointerEvents = 'none';
    contactForm.style.opacity = '0.7';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(contactForm)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.success) {
        btn.textContent = 'Enquiry Sent ✓';
        contactForm.reset();
        setTimeout(function () {
          btn.textContent = originalText;
          contactForm.style.pointerEvents = '';
          contactForm.style.opacity = '';
        }, 4000);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    })
    .catch(function (err) {
      console.error('Form error:', err);
      btn.textContent = 'Error — try again';
      contactForm.style.pointerEvents = '';
      contactForm.style.opacity = '';
      setTimeout(function () {
        btn.textContent = originalText;
      }, 3000);
    });
  });
}

// ── LANGUAGE SWITCHER ───────────────────────────────────────────
var TRANSLATIONS = {
  en: {
    nav: { whatWeDo: 'What', ourStory: 'Who', connect: 'Connect' },
    hero: {
      tagline: 'Built for Those Who Build',
      descHeader: 'Method Index integrates a wide array of disciplines to our Consulting Services.',
      descBody: 'Rabih Sater\'s long experience, healthy track record and the successful brands we\'ve worked with, can provide new or existing business consulting in Business Concept Development, Identity Design, Business Operations, Brand Experience and Strategical Marketing. Demographics, Geography, Area Development and Financial Analysis can also be part of an extensive consulting study to get your business up and operating successfully.'
    },
    whatIntro: {
      heading: 'Our services are customized to the needs and specifications of each client – we do not adhere to the belief that the unique needs of our clients can be satisfied with a pre-programmed approach.',
      body: 'This means that we spend a lot of time in the field understanding what makes each business or product micro-market unique. We also get to know people at all levels in order to completely understand their priorities, processes, perceptions and concerns. In addition, we bring a rigorous financial methodology to our work. Every recommendation is evaluated in terms of its highest value and return on your investment. And we know how important your investment is.'
    },
    mission: {
      quote: 'Our mission<br><em>is your success.</em>',
      sub: 'We do not adhere to the belief that the unique needs of our clients can be satisfied with a pre-programmed approach.'
    },
    services: {
      label: 'What We Do',
      tagline: 'Five disciplines.<br>One integrated approach.',
      names: ['Concept Development','Identity Design','Business Operations','Brand Experience','Marketing Strategy'],
      descs: [
        'We identify your core market, define your offering, and build the strategic foundation every successful brand requires.',
        'Brand language, visual systems, and consumer positioning crafted to command attention and hold it.',
        'Management strategy, HR development, and operational architecture built to scale without compromise.',
        'Interior and exterior environments, social presence, and every touchpoint that defines how your brand is felt.',
        'Local market intelligence, lifestyle positioning, and social campaigns that reach the right people precisely.'
      ],
      marquee: 'Concept Development &nbsp;\u00b7&nbsp; Identity Design &nbsp;\u00b7&nbsp; Business Operations &nbsp;\u00b7&nbsp; Brand Experience &nbsp;\u00b7&nbsp; Marketing Strategy &nbsp;\u00b7&nbsp; Concept Development &nbsp;\u00b7&nbsp; Identity Design &nbsp;\u00b7&nbsp; Business Operations &nbsp;\u00b7&nbsp; Brand Experience &nbsp;\u00b7&nbsp; Marketing Strategy &nbsp;\u00b7&nbsp;'
    },
    about: {
      label: 'Our Story',
      heading: 'Rabih Sater<br><em>built this from nothing.</em>',
      body: [
        'From the age of five, Rabih Sater learned business the way most people never do \u2014 by living inside one. Raised in a family of operators, he spent his childhood watching how environments shape customers, how operations shape teams, and how brands either command rooms or disappear into them.',
        'By the time he founded Method Index, he had managed a collection of retail and real estate businesses with over 350 employees. Not as an observer. As the person responsible for everything.'
      ],
      quote: '\u201cI\u2019ve always dreamt of developing businesses through environments and experience. Unfortunately, 90% of brands are missing one or the other.\u201d',
      cite: '\u2014 Rabih Sater, Founder'
    },
    process: {
      label: 'Engagement',
      heading: 'A structured path<br><em>to transformation.</em>',
      names: ['Discovery &amp; Assessment','Strategy Architecture','Integrated Execution','Measurement &amp; Evolution'],
      details: [
        'We immerse ourselves in your business before proposing a single solution.',
        'A custom roadmap built around your market, your team, and your ambition.',
        'We work across all five disciplines simultaneously \u2014 no siloed thinking.',
        'Every engagement is monitored, refined, and held to results that matter.'
      ],
      pricing: 'Engagements from <em>$50,000</em> \u2014 structured to the specific needs of your business.'
    },
    contact: {
      label: 'Connect',
      heading: 'Begin your<br><em>engagement.</em>',
      sub: 'We work with a limited number of clients each year. If you are ready to build something extraordinary, we want to hear from you.',
      formTitle: 'We want to be part of your success.',
      firstName: 'First Name', firstNamePh: 'First name',
      lastName: 'Last Name', lastNamePh: 'Last name',
      email: 'Email', emailPh: 'your@email.com',
      phone: 'Phone Number', phonePh: '+1 000 000 0000',
      company: 'Company', companyPh: 'Company or brand name',
      aboutYourself: 'Tell us about yourself', aboutYourselfPh: 'Your background, experience, and what drives you.',
      aboutBusiness: 'Tell us about your business or product', aboutBusinessPh: 'Describe your business, your goals, and what you\u2019re looking to achieve.',
      submit: 'Send Enquiry'
    },
    footer: '&copy; 2026 Method Index, LLC. All Rights Reserved.'
  },

  es: {
    nav: { whatWeDo: 'Qué', ourStory: 'Quién', connect: 'Contacto' },
    hero: {
      tagline: 'Construido para Quienes Construyen',
      descHeader: 'Method Index integra una amplia gama de disciplinas en nuestros Servicios de Consultor\u00eda.',
      descBody: 'La larga experiencia de Rabih Sater, su historial exitoso y las reconocidas marcas con las que hemos trabajado nos permiten ofrecer consultor\u00eda empresarial a negocios nuevos o existentes en Desarrollo de Concepto, Dise\u00f1o de Identidad, Operaciones Empresariales, Experiencia de Marca y Marketing Estrat\u00e9gico. La demograf\u00eda, geograf\u00eda, desarrollo de zonas y an\u00e1lisis financiero tambi\u00e9n pueden ser parte de un estudio de consultor\u00eda exhaustivo para poner en marcha su negocio con \u00e9xito.'
    },
    whatIntro: {
      heading: 'Nuestros servicios est\u00e1n personalizados seg\u00fan las necesidades y especificaciones de cada cliente \u2013 no creemos que las necesidades \u00fanicas de nuestros clientes puedan satisfacerse con un enfoque predise\u00f1ado.',
      body: 'Esto significa que pasamos mucho tiempo en el campo comprendiendo qu\u00e9 hace \u00fanico a cada negocio o producto en su micro-mercado. Tambi\u00e9n llegamos a conocer a las personas en todos los niveles para entender completamente sus prioridades, procesos, percepciones y preocupaciones. Adem\u00e1s, aplicamos una rigurosa metodolog\u00eda financiera en nuestro trabajo. Cada recomendaci\u00f3n se eval\u00faa en t\u00e9rminos de su mayor valor y retorno sobre su inversi\u00f3n. Y sabemos lo importante que es su inversi\u00f3n.'
    },
    mission: {
      quote: 'Nuestra misi\u00f3n<br><em>es tu \u00e9xito.</em>',
      sub: 'No creemos que las necesidades \u00fanicas de nuestros clientes puedan satisfacerse con un enfoque predise\u00f1ado.'
    },
    services: {
      label: 'Qu\u00e9 Hacemos',
      tagline: 'Cinco disciplinas.<br>Un enfoque integrado.',
      names: ['Desarrollo de Concepto','Dise\u00f1o de Identidad','Operaciones Empresariales','Experiencia de Marca','Estrategia de Marketing'],
      descs: [
        'Identificamos tu mercado principal, definimos tu propuesta y construimos la base estrat\u00e9gica que toda marca exitosa requiere.',
        'Lenguaje de marca, sistemas visuales y posicionamiento del consumidor dise\u00f1ados para captar la atenci\u00f3n y mantenerla.',
        'Estrategia de gesti\u00f3n, desarrollo de recursos humanos y arquitectura operativa construida para escalar sin compromisos.',
        'Ambientes interiores y exteriores, presencia digital y cada punto de contacto que define c\u00f3mo se percibe tu marca.',
        'Inteligencia de mercado local, posicionamiento de estilo de vida y campa\u00f1as sociales que alcanzan a las personas correctas con precisi\u00f3n.'
      ],
      marquee: 'Desarrollo de Concepto &nbsp;\u00b7&nbsp; Dise\u00f1o de Identidad &nbsp;\u00b7&nbsp; Operaciones Empresariales &nbsp;\u00b7&nbsp; Experiencia de Marca &nbsp;\u00b7&nbsp; Estrategia de Marketing &nbsp;\u00b7&nbsp; Desarrollo de Concepto &nbsp;\u00b7&nbsp; Dise\u00f1o de Identidad &nbsp;\u00b7&nbsp; Operaciones Empresariales &nbsp;\u00b7&nbsp; Experiencia de Marca &nbsp;\u00b7&nbsp; Estrategia de Marketing &nbsp;\u00b7&nbsp;'
    },
    about: {
      label: 'Nuestra Historia',
      heading: 'Rabih Sater<br><em>lo construy\u00f3 desde cero.</em>',
      body: [
        'Desde los cinco a\u00f1os, Rabih Sater aprendi\u00f3 los negocios como pocas personas lo hacen \u2014 vivi\u00e9ndolos desde adentro. Criado en una familia de operadores, pas\u00f3 su infancia observando c\u00f3mo los entornos moldean a los clientes, c\u00f3mo las operaciones moldean a los equipos y c\u00f3mo las marcas o conquistan los espacios o desaparecen en ellos.',
        'Cuando fund\u00f3 Method Index, ya hab\u00eda gestionado una cartera de negocios de retail y bienes ra\u00edces con m\u00e1s de 350 empleados. No como observador. Como el responsable de todo.'
      ],
      quote: '\u201cSiempre so\u00f1\u00e9 con desarrollar negocios a trav\u00e9s de entornos y experiencias. Desafortunadamente, el 90% de las marcas carece de uno o del otro.\u201d',
      cite: '\u2014 Rabih Sater, Fundador'
    },
    process: {
      label: 'Proceso',
      heading: 'Un camino estructurado<br><em>hacia la transformaci\u00f3n.</em>',
      names: ['Descubrimiento y Evaluaci\u00f3n','Arquitectura Estrat\u00e9gica','Ejecuci\u00f3n Integrada','Medici\u00f3n y Evoluci\u00f3n'],
      details: [
        'Nos sumergimos en tu negocio antes de proponer una sola soluci\u00f3n.',
        'Una hoja de ruta personalizada dise\u00f1ada en torno a tu mercado, tu equipo y tu ambici\u00f3n.',
        'Trabajamos en las cinco disciplinas simult\u00e1neamente \u2014 sin pensamiento aislado.',
        'Cada proyecto se monitorea, refina y se eval\u00faa seg\u00fan resultados que importan.'
      ],
      pricing: 'Proyectos desde <em>$50,000</em> \u2014 estructurados seg\u00fan las necesidades espec\u00edficas de tu negocio.'
    },
    contact: {
      label: 'Contacto',
      heading: 'Comienza tu<br><em>colaboraci\u00f3n.</em>',
      sub: 'Trabajamos con un n\u00famero limitado de clientes cada a\u00f1o. Si est\u00e1s listo para construir algo extraordinario, queremos saber de ti.',
      formTitle: 'Queremos ser parte de tu \u00e9xito.',
      firstName: 'Nombre', firstNamePh: 'Tu nombre',
      lastName: 'Apellido', lastNamePh: 'Tu apellido',
      email: 'Correo electr\u00f3nico', emailPh: 'tu@correo.com',
      phone: 'N\u00famero de tel\u00e9fono', phonePh: '+1 000 000 0000',
      company: 'Empresa', companyPh: 'Nombre de empresa o marca',
      aboutYourself: 'Cu\u00e9ntanos sobre ti', aboutYourselfPh: 'Tu trayectoria, experiencia y lo que te motiva.',
      aboutBusiness: 'Cu\u00e9ntanos sobre tu negocio o producto', aboutBusinessPh: 'Describe tu negocio, tus objetivos y lo que deseas lograr.',
      submit: 'Enviar Consulta'
    },
    footer: '&copy; 2026 Method Index, LLC. Todos los derechos reservados.'
  },

  fr: {
    nav: { whatWeDo: 'Quoi', ourStory: 'Qui', connect: 'Contact' },
    hero: {
      tagline: 'Con\u00e7u pour Ceux Qui Construisent',
      descHeader: 'Method Index int\u00e8gre un large \u00e9ventail de disciplines dans nos Services de Conseil.',
      descBody: 'La longue exp\u00e9rience de Rabih Sater, son solide bilan et les marques reconnues avec lesquelles nous avons travaill\u00e9 nous permettent d\u2019offrir des conseils en affaires \u00e0 des entreprises nouvelles ou existantes dans le D\u00e9veloppement de Concept, le Design d\u2019Identit\u00e9, les Op\u00e9rations Commerciales, l\u2019Exp\u00e9rience de Marque et le Marketing Strat\u00e9gique. La d\u00e9mographie, la g\u00e9ographie, le d\u00e9veloppement de zones et l\u2019analyse financi\u00e8re peuvent \u00e9galement faire partie d\u2019une \u00e9tude de conseil approfondie pour faire d\u00e9marrer votre entreprise avec succ\u00e8s.'
    },
    whatIntro: {
      heading: 'Nos services sont personnalis\u00e9s selon les besoins et sp\u00e9cifications de chaque client \u2013 nous ne croyons pas que les besoins uniques de nos clients peuvent \u00eatre satisfaits par une approche pr\u00e9con\u00e7ue.',
      body: 'Cela signifie que nous passons beaucoup de temps sur le terrain \u00e0 comprendre ce qui rend chaque entreprise ou produit unique dans son micro-march\u00e9. Nous apprenons \u00e9galement \u00e0 conna\u00eetre les personnes \u00e0 tous les niveaux afin de comprendre pleinement leurs priorit\u00e9s, processus, perceptions et pr\u00e9occupations. De plus, nous appliquons une m\u00e9thodologie financi\u00e8re rigoureuse \u00e0 notre travail. Chaque recommandation est \u00e9valu\u00e9e en termes de valeur maximale et de retour sur votre investissement. Et nous savons \u00e0 quel point votre investissement est important.'
    },
    mission: {
      quote: 'Notre mission,<br><em>c\u2019est votre succ\u00e8s.</em>',
      sub: 'Nous ne croyons pas que les besoins uniques de nos clients puissent \u00eatre satisfaits par une approche pr\u00e9con\u00e7ue.'
    },
    services: {
      label: 'Nos Services',
      tagline: 'Cinq disciplines.<br>Une approche int\u00e9gr\u00e9e.',
      names: ['D\u00e9veloppement du Concept','Design d\u2019Identit\u00e9','Op\u00e9rations Commerciales','Exp\u00e9rience de Marque','Strat\u00e9gie Marketing'],
      descs: [
        'Nous identifions votre march\u00e9 principal, d\u00e9finissons votre offre et construisons les fondements strat\u00e9giques que toute marque r\u00e9ussie requiert.',
        'Langage de marque, syst\u00e8mes visuels et positionnement consommateur con\u00e7us pour capter l\u2019attention et la retenir.',
        'Strat\u00e9gie de gestion, d\u00e9veloppement des ressources humaines et architecture op\u00e9rationnelle construite pour \u00e9voluer sans compromis.',
        'Environnements int\u00e9rieurs et ext\u00e9rieurs, pr\u00e9sence sociale et chaque point de contact qui d\u00e9finit la fa\u00e7on dont votre marque est ressentie.',
        'Intelligence du march\u00e9 local, positionnement lifestyle et campagnes sociales qui atteignent les bonnes personnes avec pr\u00e9cision.'
      ],
      marquee: 'D\u00e9veloppement du Concept &nbsp;\u00b7&nbsp; Design d\u2019Identit\u00e9 &nbsp;\u00b7&nbsp; Op\u00e9rations Commerciales &nbsp;\u00b7&nbsp; Exp\u00e9rience de Marque &nbsp;\u00b7&nbsp; Strat\u00e9gie Marketing &nbsp;\u00b7&nbsp; D\u00e9veloppement du Concept &nbsp;\u00b7&nbsp; Design d\u2019Identit\u00e9 &nbsp;\u00b7&nbsp; Op\u00e9rations Commerciales &nbsp;\u00b7&nbsp; Exp\u00e9rience de Marque &nbsp;\u00b7&nbsp; Strat\u00e9gie Marketing &nbsp;\u00b7&nbsp;'
    },
    about: {
      label: 'Notre Histoire',
      heading: 'Rabih Sater<br><em>a tout construit de z\u00e9ro.</em>',
      body: [
        'D\u00e8s l\u2019\u00e2ge de cinq ans, Rabih Sater a appris les affaires d\u2019une fa\u00e7on que peu de gens connaissent \u2014 en vivant de l\u2019int\u00e9rieur. \u00c9lev\u00e9 dans une famille d\u2019entrepreneurs, il a pass\u00e9 son enfance \u00e0 observer comment les environnements fa\u00e7onnent les clients, comment les op\u00e9rations fa\u00e7onnent les \u00e9quipes et comment les marques soit s\u2019imposent soit disparaissent.',
        'Au moment o\u00f9 il a fond\u00e9 Method Index, il avait d\u00e9j\u00e0 g\u00e9r\u00e9 un ensemble d\u2019entreprises de retail et d\u2019immobilier avec plus de 350 employ\u00e9s. Non pas en tant qu\u2019observateur. En tant que responsable de tout.'
      ],
      quote: '\u201cJ\u2019ai toujours r\u00eav\u00e9 de d\u00e9velopper des entreprises \u00e0 travers les environnements et l\u2019exp\u00e9rience. Malheureusement, 90% des marques manquent de l\u2019un ou de l\u2019autre.\u201d',
      cite: '\u2014 Rabih Sater, Fondateur'
    },
    process: {
      label: 'Engagement',
      heading: 'Un parcours structur\u00e9<br><em>vers la transformation.</em>',
      names: ['D\u00e9couverte et \u00c9valuation','Architecture Strat\u00e9gique','Ex\u00e9cution Int\u00e9gr\u00e9e','Mesure et \u00c9volution'],
      details: [
        'Nous nous immergeons dans votre entreprise avant de proposer la moindre solution.',
        'Une feuille de route sur mesure construite autour de votre march\u00e9, votre \u00e9quipe et votre ambition.',
        'Nous travaillons sur les cinq disciplines simultan\u00e9ment \u2014 sans cloisonnement.',
        'Chaque engagement est suivi, affin\u00e9 et \u00e9valu\u00e9 selon des r\u00e9sultats qui comptent.'
      ],
      pricing: 'Missions \u00e0 partir de <em>50\u202f000\u202f$</em> \u2014 structur\u00e9es selon les besoins sp\u00e9cifiques de votre entreprise.'
    },
    contact: {
      label: 'Contact',
      heading: 'Commencez votre<br><em>engagement.</em>',
      sub: 'Nous travaillons avec un nombre limit\u00e9 de clients chaque ann\u00e9e. Si vous \u00eates pr\u00eat \u00e0 construire quelque chose d\u2019extraordinaire, nous voulons vous entendre.',
      formTitle: 'Nous voulons faire partie de votre succ\u00e8s.',
      firstName: 'Pr\u00e9nom', firstNamePh: 'Votre pr\u00e9nom',
      lastName: 'Nom', lastNamePh: 'Votre nom de famille',
      email: 'Email', emailPh: 'votre@email.com',
      phone: 'Num\u00e9ro de t\u00e9l\u00e9phone', phonePh: '+1 000 000 0000',
      company: 'Entreprise', companyPh: 'Nom de l\u2019entreprise ou de la marque',
      aboutYourself: 'Parlez-nous de vous', aboutYourselfPh: 'Votre parcours, exp\u00e9rience et ce qui vous motive.',
      aboutBusiness: 'Parlez-nous de votre entreprise ou produit', aboutBusinessPh: 'D\u00e9crivez votre entreprise, vos objectifs et ce que vous souhaitez accomplir.',
      submit: 'Envoyer'
    },
    footer: '&copy; 2026 Method Index, LLC. Tous droits r\u00e9serv\u00e9s.'
  },

  it: {
    nav: { whatWeDo: 'Cosa', ourStory: 'Chi', connect: 'Contatti' },
    hero: {
      tagline: 'Fatto per Chi Costruisce',
      descHeader: 'Method Index integra un\'ampia gamma di discipline nei nostri Servizi di Consulenza.',
      descBody: 'La lunga esperienza di Rabih Sater, il suo solido track record e i brand di successo con cui abbiamo lavorato ci consentono di offrire consulenza aziendale a imprese nuove o esistenti in Sviluppo del Concetto, Design dell\'Identità, Operazioni Aziendali, Brand Experience e Marketing Strategico. La demografia, la geografia, lo sviluppo delle aree e l\'analisi finanziaria possono anche far parte di uno studio di consulenza approfondito per avviare con successo la tua attività.'
    },
    whatIntro: {
      heading: 'I nostri servizi sono personalizzati in base alle esigenze e specifiche di ciascun cliente – non crediamo che le esigenze uniche dei nostri clienti possano essere soddisfatte con un approccio standardizzato.',
      body: 'Questo significa che trascorriamo molto tempo sul campo a capire cosa rende unico ogni business o prodotto nel suo micro-mercato. Impariamo anche a conoscere le persone a tutti i livelli per comprendere appieno le loro priorità, processi, percezioni e preoccupazioni. Inoltre, applichiamo una rigorosa metodologia finanziaria al nostro lavoro. Ogni raccomandazione viene valutata in termini di massimo valore e ritorno sul tuo investimento. E sappiamo quanto sia importante il tuo investimento.'
    },
    mission: {
      quote: 'La nostra missione<br><em>\u00e8 il tuo successo.</em>',
      sub: 'Non crediamo che le esigenze uniche dei nostri clienti possano essere soddisfatte con un approccio standardizzato.'
    },
    services: {
      label: 'Cosa Facciamo',
      tagline: 'Cinque discipline.<br>Un approccio integrato.',
      names: ['Sviluppo del Concetto','Design dell\u2019Identit\u00e0','Operazioni Aziendali','Brand Experience','Strategia di Marketing'],
      descs: [
        'Identifichiamo il tuo mercato principale, definiamo la tua offerta e costruiamo le fondamenta strategiche che ogni brand di successo richiede.',
        'Linguaggio di brand, sistemi visivi e posizionamento del consumatore creati per catturare l\u2019attenzione e mantenerla.',
        'Strategia gestionale, sviluppo delle risorse umane e architettura operativa costruita per scalare senza compromessi.',
        'Ambienti interni ed esterni, presenza social e ogni punto di contatto che definisce come il tuo brand viene percepito.',
        'Intelligenza del mercato locale, posizionamento lifestyle e campagne social che raggiungono le persone giuste con precisione.'
      ],
      marquee: 'Sviluppo del Concetto &nbsp;\u00b7&nbsp; Design dell\u2019Identit\u00e0 &nbsp;\u00b7&nbsp; Operazioni Aziendali &nbsp;\u00b7&nbsp; Brand Experience &nbsp;\u00b7&nbsp; Strategia di Marketing &nbsp;\u00b7&nbsp; Sviluppo del Concetto &nbsp;\u00b7&nbsp; Design dell\u2019Identit\u00e0 &nbsp;\u00b7&nbsp; Operazioni Aziendali &nbsp;\u00b7&nbsp; Brand Experience &nbsp;\u00b7&nbsp; Strategia di Marketing &nbsp;\u00b7&nbsp;'
    },
    about: {
      label: 'La Nostra Storia',
      heading: 'Rabih Sater<br><em>ha costruito tutto da zero.</em>',
      body: [
        'Fin dall\u2019et\u00e0 di cinque anni, Rabih Sater ha imparato il business come poche persone fanno \u2014 vivendolo dall\u2019interno. Cresciuto in una famiglia di operatori, ha trascorso l\u2019infanzia osservando come gli ambienti plasmano i clienti, come le operazioni plasmano i team e come i brand o conquistano le stanze o scompaiono in esse.',
        'Quando ha fondato Method Index, aveva gi\u00e0 gestito una serie di attivit\u00e0 retail e immobiliari con oltre 350 dipendenti. Non come osservatore. Come la persona responsabile di tutto.'
      ],
      quote: '\u201cHo sempre sognato di sviluppare aziende attraverso ambienti ed esperienze. Purtroppo, il 90% dei brand manca dell\u2019uno o dell\u2019altro.\u201d',
      cite: '\u2014 Rabih Sater, Fondatore'
    },
    process: {
      label: 'Engagement',
      heading: 'Un percorso strutturato<br><em>verso la trasformazione.</em>',
      names: ['Scoperta e Valutazione','Architettura Strategica','Esecuzione Integrata','Misurazione ed Evoluzione'],
      details: [
        'Ci immergiamo nel tuo business prima di proporre una singola soluzione.',
        'Una road map personalizzata costruita attorno al tuo mercato, al tuo team e alla tua ambizione.',
        'Lavoriamo su tutte e cinque le discipline simultaneamente \u2014 nessun pensiero in silos.',
        'Ogni engagement viene monitorato, affinato e valutato in base a risultati che contano.'
      ],
      pricing: 'Engagement a partire da <em>$50.000</em> \u2014 strutturati in base alle specifiche esigenze del tuo business.'
    },
    contact: {
      label: 'Contatti',
      heading: 'Inizia il tuo<br><em>percorso.</em>',
      sub: 'Lavoriamo con un numero limitato di clienti ogni anno. Se sei pronto a costruire qualcosa di straordinario, vogliamo sentirti.',
      formTitle: 'Vogliamo essere parte del tuo successo.',
      firstName: 'Nome', firstNamePh: 'Il tuo nome',
      lastName: 'Cognome', lastNamePh: 'Il tuo cognome',
      email: 'Email', emailPh: 'tua@email.com',
      phone: 'Numero di telefono', phonePh: '+1 000 000 0000',
      company: 'Azienda', companyPh: 'Nome dell\u2019azienda o del brand',
      aboutYourself: 'Raccontaci di te', aboutYourselfPh: 'La tua esperienza, il tuo percorso e cosa ti motiva.',
      aboutBusiness: 'Raccontaci della tua attivit\u00e0 o prodotto', aboutBusinessPh: 'Descrivi la tua attivit\u00e0, i tuoi obiettivi e ci\u00f2 che vuoi raggiungere.',
      submit: 'Invia Richiesta'
    },
    footer: '&copy; 2026 Method Index, LLC. Tutti i diritti riservati.'
  },

  ar: {
    nav: { whatWeDo: 'ماذا', ourStory: 'من', connect: 'تواصل' },
    hero: {
      tagline: '\u0635\u064f\u0646\u0639 \u0644\u0645\u0646 \u064a\u0628\u0646\u064a',
      descHeader: 'Method Index \u062a\u062f\u0645\u062c \u0645\u062c\u0645\u0648\u0639\u0629 \u0648\u0627\u0633\u0639\u0629 \u0645\u0646 \u0627\u0644\u062a\u062e\u0635\u0635\u0627\u062a \u0641\u064a \u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0627\u062a \u0644\u062f\u064a\u0646\u0627.',
      descBody: '\u062a\u062a\u064a\u062d \u062e\u0628\u0631\u0629 \u0631\u0628\u064a\u0639 \u0633\u0627\u0637\u0631 \u0627\u0644\u0637\u0648\u064a\u0644\u0629\u060c \u0648\u0633\u062c\u0644\u0647 \u0627\u0644\u062d\u0627\u0641\u0644 \u0628\u0627\u0644\u0646\u062c\u0627\u062d\u0627\u062a\u060c \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0627\u0644\u0646\u0627\u062c\u062d\u0629 \u0627\u0644\u062a\u064a \u0639\u0645\u0644\u0646\u0627 \u0645\u0639\u0647\u0627\u060c \u062a\u0642\u062f\u064a\u0645 \u0627\u0633\u062a\u0634\u0627\u0631\u0627\u062a \u062a\u062c\u0627\u0631\u064a\u0629 \u0644\u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0623\u0648 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0641\u064a \u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0648\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0647\u0648\u064a\u0629 \u0648\u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0648\u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0648\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a. \u0643\u0645\u0627 \u064a\u0645\u0643\u0646 \u0623\u0646 \u062a\u0634\u0645\u0644 \u0627\u0644\u062f\u0631\u0627\u0633\u0629 \u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u062f\u064a\u0645\u0648\u063a\u0631\u0627\u0641\u064a \u0648\u0627\u0644\u062c\u063a\u0631\u0627\u0641\u064a \u0648\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0648\u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0645\u0627\u0644\u064a \u0644\u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0639\u0644\u0649 \u0625\u0637\u0644\u0627\u0642 \u0645\u0634\u0631\u0648\u0639\u0643 \u0628\u0646\u062c\u0627\u062d.'
    },
    whatIntro: {
      heading: '\u062e\u062f\u0645\u0627\u062a\u0646\u0627 \u0645\u062e\u0635\u0651\u0635\u0629 \u0648\u0641\u0642 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u0648\u0645\u0648\u0627\u0635\u0641\u0627\u062a \u0643\u0644 \u0639\u0645\u064a\u0644 \u2013 \u0644\u0627 \u0646\u0624\u0645\u0646 \u0628\u0623\u0646 \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u0627\u0644\u0641\u0631\u064a\u062f\u0629 \u0644\u0639\u0645\u0644\u0627\u0626\u0646\u0627 \u064a\u0645\u0643\u0646 \u062a\u0644\u0628\u064a\u062a\u0647\u0627 \u0645\u0646 \u062e\u0644\u0627\u0644 \u0646\u0647\u062c \u062c\u0627\u0647\u0632 \u0648\u0645\u0628\u0631\u0645\u062c \u0645\u0633\u0628\u0642\u0627\u064b.',
      body: '\u0647\u0630\u0627 \u064a\u0639\u0646\u064a \u0623\u0646\u0646\u0627 \u0646\u0642\u0636\u064a \u0648\u0642\u062a\u0627\u064b \u0637\u0648\u064a\u0644\u0627\u064b \u0641\u064a \u0627\u0644\u0645\u064a\u062f\u0627\u0646 \u0644\u0641\u0647\u0645 \u0645\u0627 \u064a\u062c\u0639\u0644 \u0643\u0644 \u0639\u0645\u0644 \u0623\u0648 \u0645\u0646\u062a\u062c \u0641\u0631\u064a\u062f\u0627\u064b \u0641\u064a \u0633\u0648\u0642\u0647 \u0627\u0644\u062f\u0642\u064a\u0642. \u0643\u0645\u0627 \u0646\u062a\u0639\u0631\u0651\u0641 \u0639\u0644\u0649 \u0627\u0644\u0646\u0627\u0633 \u0639\u0644\u0649 \u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0633\u062a\u0648\u064a\u0627\u062a \u0644\u0641\u0647\u0645 \u0623\u0648\u0644\u0648\u064a\u0627\u062a\u0647\u0645 \u0648\u0639\u0645\u0644\u064a\u0627\u062a\u0647\u0645 \u0648\u062a\u0635\u0648\u0631\u0627\u062a\u0647\u0645 \u0648\u0645\u062e\u0627\u0648\u0641\u0647\u0645 \u0628\u0634\u0643\u0644 \u0643\u0627\u0645\u0644. \u0628\u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0630\u0644\u0643\u060c \u0646\u0637\u0628\u0651\u0642 \u0645\u0646\u0647\u062c\u064a\u0629 \u0645\u0627\u0644\u064a\u0629 \u0635\u0627\u0631\u0645\u0629 \u0641\u064a \u0639\u0645\u0644\u0646\u0627. \u062a\u064f\u0642\u064a\u0651\u0645 \u0643\u0644 \u062a\u0648\u0635\u064a\u0629 \u0645\u0646 \u062d\u064a\u062b \u0623\u0639\u0644\u0649 \u0642\u064a\u0645\u0629 \u0648\u0639\u0627\u0626\u062f \u0639\u0644\u0649 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u0643. \u0648\u0646\u062d\u0646 \u0646\u062f\u0631\u0643 \u062c\u064a\u062f\u0627\u064b \u0645\u062f\u0649 \u0623\u0647\u0645\u064a\u0629 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u0643.'
    },
    mission: {
      quote: '\u0645\u0647\u0645\u0651\u062a\u0646\u0627<br><em>\u0647\u064a \u0646\u062c\u0627\u062d\u0643.</em>',
      sub: '\u0644\u0627 \u0646\u0624\u0645\u0646 \u0628\u0623\u0646 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u0639\u0645\u0644\u0627\u0626\u0646\u0627 \u0627\u0644\u0641\u0631\u064a\u062f\u0629 \u064a\u0645\u0643\u0646 \u062a\u0644\u0628\u064a\u062a\u0647\u0627 \u0645\u0646 \u062e\u0644\u0627\u0644 \u0646\u0647\u062c \u062c\u0627\u0647\u0632 \u0648\u0645\u0628\u0631\u0645\u062c \u0645\u0633\u0628\u0642\u0627\u064b.'
    },
    services: {
      label: '\u0645\u0627 \u0646\u0642\u062f\u0651\u0645\u0647',
      tagline: '\u062e\u0645\u0633\u0629 \u062a\u062e\u0635\u0635\u0627\u062a.<br>\u0646\u0647\u062c \u0648\u0627\u062d\u062f \u0645\u062a\u0643\u0627\u0645\u0644.',
      names: ['\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0641\u0647\u0648\u0645','\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0647\u0648\u064a\u0651\u0629','\u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629','\u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629','\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0627\u0644\u062a\u0633\u0648\u064a\u0642'],
      descs: [
        '\u0646\u062d\u062f\u0651\u062f \u0633\u0648\u0642\u0643 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u060c \u0648\u0646\u0635\u0648\u063a \u0639\u0631\u0636\u0643\u060c \u0648\u0646\u0628\u0646\u064a \u0627\u0644\u0623\u0633\u0627\u0633 \u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a \u0627\u0644\u0630\u064a \u062a\u062d\u062a\u0627\u062c\u0647 \u0643\u0644 \u0639\u0644\u0627\u0645\u0629 \u062a\u062c\u0627\u0631\u064a\u0629 \u0646\u0627\u062c\u062d\u0629.',
        '\u0644\u063a\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u0648\u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0633\u062a\u0647\u0644\u0643\u060c \u0645\u0635\u0645\u0651\u0645\u0629 \u0644\u062a\u062c\u0630\u0628 \u0627\u0644\u0627\u0646\u062a\u0628\u0627\u0647 \u0648\u062a\u062d\u0627\u0641\u0638 \u0639\u0644\u064a\u0647.',
        '\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0648\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629 \u0648\u0627\u0644\u0628\u0646\u064a\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u064a\u0629 \u0627\u0644\u0645\u0628\u0646\u064a\u0629 \u0644\u0644\u062a\u0648\u0633\u0651\u0639 \u062f\u0648\u0646 \u062a\u0646\u0627\u0632\u0644\u0627\u062a.',
        '\u0627\u0644\u0628\u064a\u0626\u0627\u062a \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629 \u0648\u0627\u0644\u062e\u0627\u0631\u062c\u064a\u0629 \u0648\u0627\u0644\u062d\u0636\u0648\u0631 \u0627\u0644\u0631\u0642\u0645\u064a \u0648\u0643\u0644 \u0646\u0642\u0637\u0629 \u062a\u0648\u0627\u0635\u0644 \u062a\u062d\u062f\u0651\u062f \u0643\u064a\u0641 \u064a\u064f\u0634\u0639\u0631 \u0628\u0639\u0644\u0627\u0645\u062a\u0643 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629.',
        '\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u062d\u0644\u064a \u0648\u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639 \u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u062d\u064a\u0627\u0629 \u0648\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a \u0627\u0644\u062a\u064a \u062a\u0635\u0644 \u0625\u0644\u0649 \u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u064a\u0646 \u0628\u062f\u0642\u0629.'
      ],
      marquee: '\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0641\u0647\u0648\u0645 &nbsp;\u00b7&nbsp; \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0647\u0648\u064a\u0651\u0629 &nbsp;\u00b7&nbsp; \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 &nbsp;\u00b7&nbsp; \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 &nbsp;\u00b7&nbsp; \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0627\u0644\u062a\u0633\u0648\u064a\u0642 &nbsp;\u00b7&nbsp; \u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0641\u0647\u0648\u0645 &nbsp;\u00b7&nbsp; \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0647\u0648\u064a\u0651\u0629 &nbsp;\u00b7&nbsp; \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 &nbsp;\u00b7&nbsp; \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 &nbsp;\u00b7&nbsp; \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0627\u0644\u062a\u0633\u0648\u064a\u0642 &nbsp;\u00b7&nbsp;'
    },
    about: {
      label: '\u0642\u0635\u0651\u062a\u0646\u0627',
      heading: '\u0631\u0628\u064a\u0639 \u0633\u0627\u0637\u0631<br><em>\u0628\u0646\u0649 \u0647\u0630\u0627 \u0645\u0646 \u0627\u0644\u0635\u0641\u0631.</em>',
      body: [
        '\u0645\u0646\u0630 \u0633\u0646 \u0627\u0644\u062e\u0627\u0645\u0633\u0629\u060c \u062a\u0639\u0644\u0651\u0645 \u0631\u0628\u064a\u0639 \u0633\u0627\u0637\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0628\u0637\u0631\u064a\u0642\u0629 \u0644\u0627 \u064a\u0639\u0631\u0641\u0647\u0627 \u0645\u0639\u0638\u0645 \u0627\u0644\u0646\u0627\u0633 \u2014 \u0628\u0627\u0644\u0639\u064a\u0634 \u062f\u0627\u062e\u0644\u0647\u0627. \u0646\u0634\u0623 \u0641\u064a \u0639\u0627\u0626\u0644\u0629 \u0645\u0646 \u0623\u0635\u062d\u0627\u0628 \u0627\u0644\u0623\u0639\u0645\u0627\u0644\u060c \u0648\u0642\u0636\u0649 \u0637\u0641\u0648\u0644\u062a\u0647 \u064a\u0631\u0627\u0642\u0628 \u0643\u064a\u0641 \u062a\u0634\u0643\u0651\u0644 \u0627\u0644\u0628\u064a\u0626\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u060c \u0648\u0643\u064a\u0641 \u062a\u0634\u0643\u0651\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0641\u0631\u064a\u0642\u060c \u0648\u0643\u064a\u0641 \u0623\u0646 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0625\u0645\u0627 \u062a\u0633\u064a\u0637\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0634\u0647\u062f \u0623\u0648 \u062a\u062e\u062a\u0641\u064a \u0641\u064a\u0647.',
        '\u0628\u062d\u0644\u0648\u0644 \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0630\u064a \u0623\u0633\u0651\u0633 \u0641\u064a\u0647 Method Index\u060c \u0643\u0627\u0646 \u0642\u062f \u0623\u062f\u0627\u0631 \u0645\u062c\u0645\u0648\u0639\u0629 \u0645\u0646 \u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u062a\u062c\u0632\u0626\u0629 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a \u0645\u0639 \u0623\u0643\u062b\u0631 \u0645\u0646 350 \u0645\u0648\u0638\u0641\u0627\u064b. \u0644\u064a\u0633 \u0643\u0645\u0631\u0627\u0642\u0628. \u0628\u0644 \u0643\u0627\u0644\u0634\u062e\u0635 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0639\u0646 \u0643\u0644 \u0634\u064a\u0621.'
      ],
      quote: '\u201c\u062f\u0627\u0626\u0645\u0627\u064b \u062d\u0644\u0645\u062a \u0628\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0645\u0646 \u062e\u0644\u0627\u0644 \u0627\u0644\u0628\u064a\u0626\u0627\u062a \u0648\u0627\u0644\u062a\u062c\u0631\u0628\u0629. \u0644\u0644\u0623\u0633\u0641\u060c 90% \u0645\u0646 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u062a\u0641\u062a\u0642\u0631 \u0625\u0644\u0649 \u0623\u062d\u062f\u0647\u0645\u0627 \u0623\u0648 \u0643\u0644\u064a\u0647\u0645\u0627.\u201d',
      cite: '\u2014 \u0631\u0628\u064a\u0639 \u0633\u0627\u0637\u0631\u060c \u0627\u0644\u0645\u0624\u0633\u0633'
    },
    process: {
      label: '\u0627\u0644\u0627\u0646\u062e\u0631\u0627\u0637',
      heading: '\u0645\u0633\u0627\u0631 \u0645\u0646\u0638\u0651\u0645<br><em>\u0646\u062d\u0648 \u0627\u0644\u062a\u062d\u0648\u0651\u0644.</em>',
      names: ['\u0627\u0644\u0627\u0643\u062a\u0634\u0627\u0641 \u0648\u0627\u0644\u062a\u0642\u064a\u064a\u0645','\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629','\u0627\u0644\u062a\u0646\u0641\u064a\u0630 \u0627\u0644\u0645\u062a\u0643\u0627\u0645\u0644','\u0627\u0644\u0642\u064a\u0627\u0633 \u0648\u0627\u0644\u062a\u0637\u0648\u0651\u0631'],
      details: [
        '\u0646\u063a\u0648\u0635 \u0641\u064a \u0623\u0639\u0645\u0627\u0642 \u0639\u0645\u0644\u0643 \u0642\u0628\u0644 \u0627\u0642\u062a\u0631\u0627\u062d \u0623\u064a \u062d\u0644.',
        '\u062e\u0627\u0631\u0637\u0629 \u0637\u0631\u064a\u0642 \u0645\u062e\u0635\u0651\u0635\u0629 \u0645\u0628\u0646\u064a\u0629 \u062d\u0648\u0644 \u0633\u0648\u0642\u0643 \u0648\u0641\u0631\u064a\u0642\u0643 \u0648\u0637\u0645\u0648\u062d\u0643.',
        '\u0646\u0639\u0645\u0644 \u0639\u0628\u0631 \u0627\u0644\u062a\u062e\u0635\u0635\u0627\u062a \u0627\u0644\u062e\u0645\u0633\u0629 \u0641\u064a \u0622\u0646\u064d \u0648\u0627\u062d\u062f \u2014 \u0644\u0627 \u0641\u0635\u0644 \u0648\u0644\u0627 \u0639\u0632\u0644.',
        '\u0643\u0644 \u0645\u0634\u0631\u0648\u0639 \u064a\u064f\u0631\u0635\u062f \u0648\u064a\u064f\u0635\u0642\u0644 \u0648\u064a\u064f\u0642\u064a\u0651\u0645 \u0648\u0641\u0642 \u0646\u062a\u0627\u0626\u062c \u062a\u0633\u062a\u062d\u0642 \u0627\u0644\u0627\u0647\u062a\u0645\u0627\u0645.'
      ],
      pricing: '\u0645\u0634\u0627\u0631\u064a\u0639 \u062a\u0628\u062f\u0623 \u0645\u0646 <em>$50,000</em> \u2014 \u0645\u0635\u0645\u0651\u0645\u0629 \u0648\u0641\u0642 \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u0627\u0644\u062e\u0627\u0635\u0629 \u0644\u0639\u0645\u0644\u0643.'
    },
    contact: {
      label: '\u062a\u0648\u0627\u0635\u0644',
      heading: '\u0627\u0628\u062f\u0623<br><em>\u0645\u0634\u0631\u0648\u0639\u0643.</em>',
      sub: '\u0646\u0639\u0645\u0644 \u0645\u0639 \u0639\u062f\u062f \u0645\u062d\u062f\u0648\u062f \u0645\u0646 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0643\u0644 \u0639\u0627\u0645. \u0625\u0630\u0627 \u0643\u0646\u062a \u0645\u0633\u062a\u0639\u062f\u0627\u064b \u0644\u0628\u0646\u0627\u0621 \u0634\u064a\u0621 \u0627\u0633\u062a\u062b\u0646\u0627\u0626\u064a\u060c \u0646\u0648\u062f\u0651 \u0623\u0646 \u0646\u0633\u0645\u0639 \u0645\u0646\u0643.',
      formTitle: '\u0646\u0631\u064a\u062f \u0623\u0646 \u0646\u0643\u0648\u0646 \u062c\u0632\u0621\u0627\u064b \u0645\u0646 \u0646\u062c\u0627\u062d\u0643.',
      firstName: '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644', firstNamePh: '\u0627\u0633\u0645\u0643 \u0627\u0644\u0623\u0648\u0644',
      lastName: '\u0627\u0644\u0644\u0642\u0628', lastNamePh: '\u0644\u0642\u0628\u0643',
      email: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a', emailPh: '\u0628\u0631\u064a\u062f\u0643@\u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a.com',
      phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641', phonePh: '+1 000 000 0000',
      company: '\u0627\u0644\u0634\u0631\u0643\u0629', companyPh: '\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 \u0623\u0648 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629',
      aboutYourself: '\u0623\u062e\u0628\u0631\u0646\u0627 \u0639\u0646\u0643', aboutYourselfPh: '\u062e\u0644\u0641\u064a\u062a\u0643 \u0648\u062e\u0628\u0631\u062a\u0643 \u0648\u0645\u0627 \u064a\u062d\u0641\u0632\u0643.',
      aboutBusiness: '\u0623\u062e\u0628\u0631\u0646\u0627 \u0639\u0646 \u0639\u0645\u0644\u0643 \u0623\u0648 \u0645\u0646\u062a\u062c\u0643', aboutBusinessPh: '\u0635\u0641 \u0639\u0645\u0644\u0643 \u0648\u0623\u0647\u062f\u0627\u0641\u0643 \u0648\u0645\u0627 \u062a\u0633\u0639\u0649 \u0625\u0644\u0649 \u062a\u062d\u0642\u064a\u0642\u0647.',
      submit: '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631'
    },
    footer: '&copy; 2026 Method Index, LLC. \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.'
  }
};

// Use CMS-generated content when available (generated by build.js from content.json + Claude API)
if (typeof CONTENT_EN !== 'undefined') TRANSLATIONS.en = CONTENT_EN;
if (typeof CONTENT_ES !== 'undefined') TRANSLATIONS.es = CONTENT_ES;
if (typeof CONTENT_FR !== 'undefined') TRANSLATIONS.fr = CONTENT_FR;
if (typeof CONTENT_IT !== 'undefined') TRANSLATIONS.it = CONTENT_IT;
if (typeof CONTENT_AR !== 'undefined') TRANSLATIONS.ar = CONTENT_AR;

function applyTranslation(lang) {
  var t = TRANSLATIONS[lang];
  if (!t) return;

  function setText(sel, val) { var el = document.querySelector(sel); if (el) el.textContent = val; }
  function setHTML(sel, val) { var el = document.querySelector(sel); if (el) el.innerHTML = val; }
  function setPH(sel, val)   { var el = document.querySelector(sel); if (el) el.placeholder = val; }

  // Direction
  var isRTL = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';

  // Load Arabic font on demand
  if (isRTL && !document.getElementById('arabic-font')) {
    var lnk = document.createElement('link');
    lnk.id  = 'arabic-font';
    lnk.rel = 'stylesheet';
    lnk.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600&display=swap';
    document.head.appendChild(lnk);
  }

  // Section labels
  setText('.showcase__section-label', t.nav.whatWeDo);
  setText('.about__section-label', t.nav.ourStory);
  setText('.contact__section-label', t.nav.connect);

  // Nav
  setText('.nav__links li:nth-child(1) a', t.nav.whatWeDo);
  setText('.nav__links li:nth-child(2) a', t.nav.ourStory);
  setText('.nav__links li:nth-child(3) a', t.nav.connect);

  // Hero
  setText('.hero__tagline', t.hero.tagline);
  if (t.hero.descHeader) setText('.hero__desc-header', t.hero.descHeader);
  if (t.hero.descBody)   setText('.hero__desc-body',   t.hero.descBody);

  // What intro
  if (t.whatIntro) {
    setText('.what-intro__heading', t.whatIntro.heading);
    setText('.what-intro__body',    t.whatIntro.body);
  }

  // Mission
  setHTML('.mission-quote p', t.mission.quote);
  setText('.mission-sub', t.mission.sub);

  // Service items (interactive panel)
  document.querySelectorAll('.service-title').forEach(function (el, i) {
    if (t.services.names[i]) el.textContent = t.services.names[i];
  });
  document.querySelectorAll('.service-desc').forEach(function (el, i) {
    if (t.services.descs[i]) el.textContent = t.services.descs[i];
  });

  // Showcase rows
  document.querySelectorAll('.showcase-row__name').forEach(function (el, i) {
    if (t.services.names[i]) el.textContent = t.services.names[i];
  });
  document.querySelectorAll('.showcase-row__desc').forEach(function (el, i) {
    if (t.services.descs[i]) el.textContent = t.services.descs[i];
  });

  // Marquee
  document.querySelectorAll('.marquee-text').forEach(function (el) {
    el.innerHTML = t.services.marquee;
  });

  // About
  setHTML('.about-heading', t.about.heading);
  var bodies = Array.isArray(t.about.body) ? t.about.body : [t.about.body];
  document.querySelectorAll('.about-body p').forEach(function (el, i) {
    if (bodies[i]) el.textContent = bodies[i];
  });
  setText('.about-quote p', t.about.quote);
  setText('.about-quote cite', t.about.cite);

  // Images (CMS-managed)
  if (t.hero && t.hero.backgroundImage) {
    var heroBg = document.querySelector('.hero__bg-img');
    if (heroBg) heroBg.src = t.hero.backgroundImage;
  }
  if (t.about && t.about.portraitImage) {
    var portrait = document.querySelector('.about-portrait-img');
    if (portrait) portrait.src = t.about.portraitImage;
  }

  // Process
  setText('.process-header .label-sm', t.process.label);
  setHTML('.process-heading', t.process.heading);
  document.querySelectorAll('.process-name').forEach(function (el, i) {
    if (t.process.names[i]) el.innerHTML = t.process.names[i];
  });
  document.querySelectorAll('.process-detail').forEach(function (el, i) {
    if (t.process.details[i]) el.textContent = t.process.details[i];
  });
  setHTML('.process-pricing p', t.process.pricing);

  // Contact
  setHTML('.contact-heading', t.contact.heading);
  setText('.contact-sub', t.contact.sub);
  var form = document.querySelector('.contact-form');
  if (form) {
    var ftitle = form.querySelector('.contact-form__title');   if (ftitle) ftitle.textContent = t.contact.formTitle;
    var ffn = form.querySelector('[for="first-name"]');        if (ffn) ffn.textContent = t.contact.firstName;
    var fln = form.querySelector('[for="last-name"]');         if (fln) fln.textContent = t.contact.lastName;
    var fe  = form.querySelector('[for="email"]');             if (fe)  fe.textContent  = t.contact.email;
    var fph = form.querySelector('[for="phone"]');             if (fph) fph.textContent = t.contact.phone;
    var fc  = form.querySelector('[for="company"]');           if (fc)  fc.textContent  = t.contact.company;
    var fay = form.querySelector('[for="about-yourself"]');    if (fay) fay.textContent = t.contact.aboutYourself;
    var fab = form.querySelector('[for="about-business"]');    if (fab) fab.textContent = t.contact.aboutBusiness;
    setPH('#first-name',     t.contact.firstNamePh);
    setPH('#last-name',      t.contact.lastNamePh);
    setPH('#email',          t.contact.emailPh);
    setPH('#phone',          t.contact.phonePh);
    setPH('#company',        t.contact.companyPh);
    setPH('#about-yourself', t.contact.aboutYourselfPh);
    setPH('#about-business', t.contact.aboutBusinessPh);
    var sb = form.querySelector('.btn-submit span'); if (sb) sb.textContent = t.contact.submit;
  }

  // Footer
  var fc2 = document.querySelector('.footer__copy'); if (fc2) fc2.innerHTML = t.footer;

  // Switcher UI
  document.querySelectorAll('.lang-option').forEach(function (el) {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
  var cur = document.querySelector('.lang-switcher__current');
  if (cur) cur.textContent = lang.toUpperCase();

  // Persist
  try { localStorage.setItem('mi-lang', lang); } catch (e) {}
}

function initLangSwitcher() {
  var switcher = document.getElementById('lang-switcher');
  if (!switcher) return;
  var btn = switcher.querySelector('.lang-switcher__btn');

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = switcher.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', function () {
    switcher.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  switcher.addEventListener('click', function (e) { e.stopPropagation(); });

  switcher.querySelectorAll('.lang-option').forEach(function (el) {
    el.addEventListener('click', function () {
      applyTranslation(el.dataset.lang);
      switcher.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Always apply translation on load so CMS content is used for English too
  var saved = 'en';
  try { saved = localStorage.getItem('mi-lang') || 'en'; } catch (e) {}
  applyTranslation(saved);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLangSwitcher);
} else {
  initLangSwitcher();
}
