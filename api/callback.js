export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Missing OAuth code.');
    return;
  }

  const proto    = req.headers['x-forwarded-proto'] || 'https';
  const host     = req.headers['x-forwarded-host']  || req.headers.host;
  const redirect = `${proto}://${host}/api/callback`;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri:  redirect
      })
    });

    const data = await response.json();

    if (!data.access_token) {
      throw new Error(data.error_description || 'GitHub did not return a token.');
    }

    const message = JSON.stringify({
      token:    data.access_token,
      provider: 'github'
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body><script>
(function () {
  function receive(e) {
    window.opener.postMessage('authorization:github:success:${message}', e.origin);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', '*');
})();
<\/script></body></html>`);

  } catch (err) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body><script>
(function () {
  function receive(e) {
    window.opener.postMessage('authorization:github:error:${err.message}', e.origin);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', '*');
})();
<\/script></body></html>`);
  }
}
