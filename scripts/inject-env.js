// Runs as Vercel's build command. Substitutes the WEB3FORMS_ACCESS_KEY
// placeholder in index.html with the real value from the Vercel project's
// environment variables — the key is never committed to the repo, it only
// ever exists in the built output Vercel serves.
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
const placeholder = '__WEB3FORMS_ACCESS_KEY__';
const key = process.env.WEB3FORMS_ACCESS_KEY || '';

if (!key) {
  console.warn('WEB3FORMS_ACCESS_KEY is not set — the contact form will show "not configured" until it is.');
}

const content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(filePath, content.split(placeholder).join(key), 'utf8');
console.log(key ? 'Injected WEB3FORMS_ACCESS_KEY into index.html' : 'Left the access_key placeholder empty (no env var set)');
