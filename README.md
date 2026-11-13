# Nowfal & Shibna — Wedding Invitation

Animated digital invitation for the wedding of **Nowfal P.E.** with **Shibna Nasreen K.A.**
Thursday, 17 December 2026 (Rajab 8, 1448) · Gonikoppal

- Nikah — 10:00 AM · Shafi Muslim Jumma Masjid, Gonikoppal
- Reception — 12:00 PM · Parimala Mangal Vihar, Gonikoppal

## Edit details

- Text on the page: `index.html`
- Dates, phone numbers, WhatsApp, map links: `js/config.js`
- Illustrations in `images/` (WebP):
  - `gate-scene.webp` — night scene behind the opening doors
  - `couple.webp` — Bride & Groom portrait
  - `groom-walk.webp`, `bride-walk.webp` — transparent cut-outs for the scroll "walk" scene
  - `masjid.webp`, `reception.webp` — event card artwork

## Personal invitations

- Guest link: `https://your-site/?to=Ahmed%20%26%20Family` — the guest's name appears on the opening screen and the invitation card.
- Link maker for the family: open `https://your-site/?host` and scroll to the bottom. Type a name, then copy the link or send it straight to WhatsApp.

## Run locally

```bash
npm start
```

Then open http://localhost:5173

## Deploy to Vercel

```bash
npx vercel --yes --prod
```
