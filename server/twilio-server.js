// Simple Express server to send SMS via Twilio
// Load .env automatically
import 'dotenv/config';
// Usage: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM in env
// Start: node server/twilio-server.js

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import twilio from 'twilio';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM; // Your Twilio phone number (E.164)

if (!accountSid || !authToken || !fromNumber) {
  console.warn('Twilio env vars missing. SMS sending will fail until configured.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

app.post('/api/sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing to or message' });
    }
    if (!client) {
      return res.status(500).json({ error: 'Twilio not configured' });
    }

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    });
    res.json({ sid: result.sid, status: result.status });
  } catch (err) {
    console.error('Twilio SMS error:', err);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Twilio SMS server running on http://localhost:${PORT}`);
});
