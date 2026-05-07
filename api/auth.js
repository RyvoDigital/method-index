export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID env var is not set.');
    return;
  }

  const proto    = req.headers['x-forwarded-proto'] || 'https';
  const host     = req.headers['x-forwarded-host']  || req.headers.host;
  const redirect = encodeURIComponent(`${proto}://${host}/api/callback`);

  res.redirect(302,
    `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo%2Cuser&redirect_uri=${redirect}`
  );
}
