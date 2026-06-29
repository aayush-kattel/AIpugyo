import express from 'express';
import axios from 'axios';
import nodemailer from 'nodemailer';

const router = express.Router();

// ── Emergency contacts ────────────────────────────────────────────────────────
const emergencyContacts = {
  kathmandu:    { police: '100',         ambulance: '102', tourist_police: '1144', rescue: '01-4111071' },
  solukhumbu:   { police: '038-520072',  ambulance: '102', tourist_police: '1144', rescue: '038-520114' },
  kaski:        { police: '061-520031',  ambulance: '102', tourist_police: '1144', rescue: '061-520078' },
  manang:       { police: '066-400012',  ambulance: '102', tourist_police: '1144', rescue: '066-400033' },
  mustang:      { police: '069-440012',  ambulance: '102', tourist_police: '1144', rescue: '069-440055' },
  chitwan:      { police: '056-522033',  ambulance: '102', tourist_police: '1144', rescue: '056-522100' },
  lalitpur:     { police: '01-5521107',  ambulance: '102', tourist_police: '1144', rescue: '01-5521200' },
  bhaktapur:    { police: '01-6610062',  ambulance: '102', tourist_police: '1144', rescue: '01-6610100' },
  dolpa:        { police: '087-550012',  ambulance: '102', tourist_police: '1144', rescue: '087-550033' },
  sindhupalchok:{ police: '011-490012',  ambulance: '102', tourist_police: '1144', rescue: '011-490055' },
};

// ── Extra email recipients from .env ──────────────────────────────────────────
const EXTRA_EMAILS = process.env.EMERGENCY_EMAILS
  ? process.env.EMERGENCY_EMAILS.split(',').map(e => e.trim())
  : [];

// ── Normalize phone number to international format ────────────────────────────
function normalizePhone(phone) {
  if (!phone) return null;
  phone = phone.replace(/\s+/g, '').replace(/-/g, '');  // remove spaces & dashes
  if (phone.startsWith('+')) return phone;               // already international
  if (phone.startsWith('977')) return `+${phone}`;       // has country code no +
  return `+977${phone}`;                                 // assume Nepal number
}

// ── Twilio SMS helper ─────────────────────────────────────────────────────────
async function sendTwilioSMS(to, message) {
  const { TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM } = process.env;
  if (!TWILIO_SID) {
    console.warn('Twilio not configured — skipping SMS');
    return null;
  }
  try {
    const res = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      new URLSearchParams({ To: to, From: TWILIO_FROM, Body: message }),
      { auth: { username: TWILIO_SID, password: TWILIO_TOKEN } }
    );
    console.log(`✅ SMS sent to ${to}:`, res.data.sid);
    return res.data;
  } catch (err) {
    console.error(`❌ Twilio SMS error (${to}):`, err.response?.data || err.message);
    return null;
  }
}

// ── GET /api/safety/contacts ──────────────────────────────────────────────────
router.get('/contacts', (req, res) => {
  const contactsArray = Object.entries(emergencyContacts).map(([district, info]) => ({
    district, ...info,
  }));
  res.json(contactsArray);
});

// ── GET /api/safety/contacts/:district ───────────────────────────────────────
router.get('/contacts/:district', (req, res) => {
  const district = req.params.district.toLowerCase();
  const contacts = emergencyContacts[district];
  if (!contacts) return res.status(404).json({ message: 'District not found' });
  res.json({ district, ...contacts });
});

// ── GET /api/safety/weather ───────────────────────────────────────────────────
router.get('/weather', async (req, res) => {
  try {
    const cityParam = req.query.city;
    const cities = cityParam
      ? [cityParam]
      : ['Kathmandu', 'Pokhara', 'Chitwan', 'Lumbini', 'Namche Bazar'];

    const results = await Promise.all(
      cities.map(city =>
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city},NP&appid=${process.env.OPENWEATHER_KEY}&units=metric`
        ).catch(() => null)
      )
    );

    const weather = results
      .filter(r => r !== null)
      .map(r => ({
        city:        r.data.name,
        temp:        r.data.main.temp,
        feels_like:  r.data.main.feels_like,
        description: r.data.weather[0].description,
        humidity:    r.data.main.humidity,
        wind:        r.data.wind.speed,
        icon:        r.data.weather[0].icon,
      }));

    if (weather.length === 0) return res.status(404).json({ message: 'City not found' });
    res.json(weather);
  } catch (err) {
    res.status(500).json({ message: 'Weather fetch failed', error: err.message });
  }
});

// ── POST /api/safety/sos ──────────────────────────────────────────────────────
// Body: { name, email, phone, lat, lng, message }
router.post('/sos', async (req, res) => {
  try {
    const { name, email, phone, lat, lng, message: customMsg } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required to send SOS' });

    const locationStr = lat && lng
      ? `GPS: ${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}\nMaps: https://maps.google.com/?q=${lat},${lng}`
      : 'Location: Could not be determined';

    // ── Email body ────────────────────────────────────────────────────────────
    const sosBody = `
🆘 SOS EMERGENCY ALERT — AI PUGYO

Traveller : ${name || 'Unknown'}
Email     : ${email}
Phone     : ${phone || 'Not provided'}

${locationStr}
Time      : ${new Date().toUTCString()}
${customMsg ? `\nMessage  : ${customMsg}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Emergency Numbers — Nepal
  Tourist Police : 1144
  Ambulance      : 102
  Nepal Police   : 100
  Mountain Rescue: 01-4111071
━━━━━━━━━━━━━━━━━━━━━━━━━━
— AI Pugyo Emergency System
    `.trim();

    // ── Send emails ───────────────────────────────────────────────────────────
    const allEmails = [email, ...EXTRA_EMAILS].filter(Boolean);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"AI Pugyo Emergency" <${process.env.SMTP_USER}>`,
      to:      process.env.SMTP_USER,
      bcc:     allEmails.join(','),
      subject: '🆘 SOS Emergency Alert — AI Pugyo Nepal',
      text:    sosBody,
      html:    `<pre style="font-family:monospace;font-size:14px;line-height:1.6">${sosBody.replace(/</g, '&lt;')}</pre>`,
    });

    console.log('✅ SOS emails sent to:', allEmails);

    // ── SMS body (keep short for SMS) ─────────────────────────────────────────
    const smsText = `🆘 SOS ALERT - AI Pugyo\nFrom: ${name || 'Unknown'} (${email})\n${locationStr}\nTime: ${new Date().toUTCString()}\nCall 1144 immediately!`;

    const smsResults = [];

    // 1) Traveller's own phone
    if (phone) {
      const normalized = normalizePhone(phone);
      const r = await sendTwilioSMS(normalized, smsText);
      smsResults.push({ to: normalized, success: !!r });
    }

    // 2) Extra emergency phones from .env
    const extraPhones = process.env.EMERGENCY_PHONES
      ? process.env.EMERGENCY_PHONES.split(',').map(p => normalizePhone(p.trim())).filter(Boolean)
      : [];

    for (const p of extraPhones) {
      const r = await sendTwilioSMS(p, smsText);
      smsResults.push({ to: p, success: !!r });
    }

    console.log('📱 SOS SMS results:', smsResults);

    res.json({
      success:      true,
      emailsSentTo: allEmails,
      smsSentTo:    smsResults.filter(s => s.success).map(s => s.to),
      smsFailed:    smsResults.filter(s => !s.success).map(s => s.to),
    });

  } catch (err) {
    console.error('SOS error:', err);
    res.status(500).json({ message: 'Failed to send SOS', error: err.message });
  }
});

export default router;