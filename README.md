# BookIt: Experiences & Slots

Monorepo with `client` (Vite + React + TS + Tailwind) and `server` (Express + MongoDB).

## Quick start

1) Server

```bash
cd server
npm install
copy ENV_SAMPLE.txt .env   # then fill MONGO_URL
npm run seed               # seed sample data
npm run start              # starts on :4000
```

2) Client

```bash
cd client
npm install
copy ENV_SAMPLE.txt .env   # optional, defaults to http://localhost:4000
npm run dev
```

Open http://localhost:5173

## Deployment

- Client: Deploy `client` to Vercel/Netlify. Build command `npm run build`. Output `dist/`.
- Server: Deploy `server` to Render/Railway. Set env `PORT`, `MONGO_URL`. Start command `npm start`.

## API

- `GET /experiences`
- `GET /experiences/:id`
- `POST /promo/validate` body `{ code, subtotal }`
- `POST /bookings` body `{ experienceId, date, time, name, email, discount }`

## Notes

- Prevents double-booking at API level. Falls back to in-memory data if `MONGO_URL` is not provided.
- UI mirrors the attached Figma: Home → Details → Checkout → Result.


