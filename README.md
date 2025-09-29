## Disaster Relief Dashboard

A Vite + React TypeScript app with a contextual AI Assistant and KendoReact UI. Includes a small Express server for sending SMS via Twilio.

Key features
- AI Assistant page backed by Google Gemini (Markdown replies, context-aware updates)
- Real-time resource updates across pages via React Context
- KendoReact-based sidebar and UI components
- Optional SMS notifications to volunteers via a minimal Node/Express + Twilio server

Tech stack
- React 19 + TypeScript, React Router
- Vite 7
- KendoReact components
- @google/generative-ai (Gemini)
- Express, Twilio (server)

---

## Quick start (local)

1) Install dependencies

```powershell
npm install
```

2) Set your environment variables (create a `.env` in the project root)

```ini
# Frontend
VITE_GEMINI_API_KEY=your_google_generative_ai_key

# Frontend -> where to POST SMS (optional; defaults to http://localhost:4000/api/sms in Volunteers page)
VITE_SMS_API_URL=http://localhost:4000/api/sms

# Server (only needed if you run the SMS server locally)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM=+15551234567
# PORT is optional; defaults to 4000
```

3) Run the SMS server (optional)

```powershell
npm run sms-server
```

4) Run the app

```powershell
npm run dev
```

Open the app printed by Vite (usually http://localhost:5173). Navigate between pages from the left sidebar. Open “AI Assistant” to chat, e.g., “Set water to 100” or “Delete all resources”.

---

## Production build

```powershell
npm run build
npm run preview
```

The static build is emitted to `dist/`.

---

## Deployment

This app has two parts:
- Frontend (static site) → deploy to Vercel, Netlify, or any static host
- SMS server (Node/Express) → deploy to Render, Railway, or similar

### Frontend (Vercel)
1. Create a new Vercel project from this repo
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SMS_API_URL` = `https://<your-sms-service>/api/sms`
6. Deploy

Vercel will handle SPA routing for React Router automatically.

### Frontend (Netlify)
1. New Site → Import from Git
2. Build: `npm run build`  Publish directory: `dist`
3. Environment variables:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SMS_API_URL` = `https://<your-sms-service>/api/sms`
4. If client-side routes 404, add an SPA fallback (Netlify redirects):
   - Create `public/_redirects` with:
     - `/* /index.html 200`

### Backend SMS server (Render)
1. Create a new “Web Service” on Render, connect this repo
2. Build command: `npm ci`
3. Start command: `node server/twilio-server.js`
4. Environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM` (E.164, e.g., `+15551234567`)
   - `PORT` (optional; Render sets this automatically)
5. After deploy, note the URL (e.g., `https://your-sms.onrender.com`)
6. Set the frontend’s `VITE_SMS_API_URL` to `https://your-sms.onrender.com/api/sms`

---

## Environment variables summary

Frontend (build-time):
- `VITE_GEMINI_API_KEY` (required for AI Assistant)
- `VITE_SMS_API_URL` (optional; defaults to `http://localhost:4000/api/sms`)

Server (runtime):
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`
- `PORT` (optional)

Note: Using `VITE_GEMINI_API_KEY` on the client exposes it publicly. For production-grade security, proxy Gemini calls via your server instead of using the key in the browser.

---

## Security: Server-side AI proxy (optional)

To hide your Gemini key, create an endpoint on the Node server (e.g., `/api/ai`) that calls `@google/generative-ai` with the server-side key and returns only the model’s text to the client. Update the frontend to call that endpoint and remove `VITE_GEMINI_API_KEY` from client env. This prevents key exposure.

---

## Troubleshooting

- Build succeeded but dev server failed earlier: ensure Node >= 18 and a clean install.
  ```powershell
  Remove-Item -Recurse -Force node_modules
  Remove-Item package-lock.json
  npm ci
  npm run dev
  ```
- SMS not sending: check Render logs and verify `TWILIO_*` env vars; ensure `VITE_SMS_API_URL` points to the correct `/api/sms` URL.
- CORS: the server enables CORS for all origins by default. You can restrict it in `server/twilio-server.js` (e.g., `cors({ origin: 'https://your-frontend.com' })`).
- Kendo licensing: this project uses KendoReact packages. Ensure you have a valid Kendo license. See `@progress/kendo-licensing` docs and your `telerik-license.txt`.

---

## Project structure (high level)

- `src/pages/AIAssistant.tsx` – AI chat UI and Gemini integration
- `src/context/DisasterContext.tsx` – global state for disasters, resources, volunteers
- `src/components/Sidebar.tsx` – Kendo PanelBar navigation
- `server/twilio-server.js` – Express route `POST /api/sms` to send SMS via Twilio
- `vite.config.ts` – Vite config

---

## License

This repository includes KendoReact packages which require a valid license for production use. Refer to Progress/Telerik terms for details.
