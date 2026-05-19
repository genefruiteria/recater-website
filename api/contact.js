const MAX_FIELD_LENGTH = 2000;

function cleanField(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value || '').trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).send('Method not allowed');
  }

  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!toEmail) {
    return response.status(500).send('Contact form is not configured.');
  }

  const body = request.body || {};

  if (cleanField(body._honey)) {
    return response.redirect(303, '/thanks');
  }

  const name = cleanField(body.name, 120);
  const email = cleanField(body.email, 180);
  const organization = cleanField(body.organization, 180);
  const message = cleanField(body.message);

  if (!name || !email || !message || !isValidEmail(email)) {
    return response.status(400).send('Please complete the required fields.');
  }

  const formData = new URLSearchParams({
    name,
    email,
    organization,
    message,
    _subject: 'New ReCater website inquiry',
    _template: 'table',
    _captcha: 'true',
  });

  const formSubmitResponse = await fetch(`https://formsubmit.co/${encodeURIComponent(toEmail)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData.toString(),
  });

  if (!formSubmitResponse.ok) {
    return response.status(502).send('The contact form could not be sent. Please try again later.');
  }

  return response.redirect(303, '/thanks');
}
