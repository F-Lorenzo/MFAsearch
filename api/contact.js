// Vercel Serverless Function — proxies the contact form to Web3Forms.
// The access key never reaches the browser: it's read here from the
// WEB3FORMS_ACCESS_KEY environment variable, set in the Vercel project
// (Settings → Environment Variables), not committed to the repo.
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ success: false, message: 'method_not_allowed' });
    }

    const { name, email, message, company, service, botcheck } = req.body || {};

    // Honeypot: real users never fill this hidden field. Pretend success, send nothing.
    if (botcheck) {
      return res.status(200).json({ success: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'missing_fields' });
    }

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      return res.status(500).json({ success: false, message: 'not_configured' });
    }

    const upstream = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        to: 'ignacio.menendez@mfasearch.com.ar',
        subject: 'Nueva consulta desde mfasearch.com.ar',
        from_name: 'Formulario MFA Search',
        name,
        email,
        company,
        service,
        message
      })
    });

    const rawText = await upstream.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('contact: web3forms returned non-JSON', upstream.status, rawText.slice(0, 500));
      return res.status(502).json({ success: false, message: 'upstream_bad_response' });
    }

    if (!upstream.ok) {
      console.error('contact: web3forms rejected the request', upstream.status, data);
    }

    return res.status(upstream.ok ? 200 : 502).json(data);
  } catch (err) {
    console.error('contact: unexpected error', err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'unexpected_error' });
  }
};
