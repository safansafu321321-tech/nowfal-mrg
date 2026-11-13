/* ============================================================
   Wedding details used by the scripts (countdown, maps,
   calendar, phone & WhatsApp buttons).
   Visible text lives in index.html.
   ============================================================ */

window.WEDDING = {
  siteUrl: "https://mrg-invitation-safan.vercel.app/",
  groom: "Nowfal",
  bride: "Shibna",
  hashtag: "#NowfalWedsShibna",

  /* Countdown target — IST (+05:30) */
  countdownTo: "2026-12-17T10:00:00+05:30",

  events: {
    nikah: {
      title: "Nikah — Nowfal & Shibna",
      start: "2026-12-17T10:00:00+05:30",
      end: "2026-12-17T11:30:00+05:30",
      place: "Shafi Muslim Jumma Masjid, Gonikoppal",
      mapsUrl: "https://maps.app.goo.gl/RCgGwETWwZGUf8nAA",
      mapsQuery: "12.1840288,75.9257516",
    },
    reception: {
      title: "Wedding Reception — Nowfal & Shibna",
      start: "2026-12-17T12:00:00+05:30",
      end: "2026-12-17T15:00:00+05:30",
      place: "Parimala Mangal Vihar, Gonikoppal",
      mapsUrl: "https://www.google.com/maps/place/Parimala+Mangala+Vihar/@12.1834217,75.9186515,17z",
      mapsQuery: "Parimala Mangala Vihar, Gonikoppal",
    },
  },

  phones: ["9481701768", "6364229355"],
  /* WhatsApp number with country code, no + or spaces */
  whatsapp: "916364229355",

  /* Maher Zain — Baraka Allahu Lakuma (official vocals-only version).
     Streams from YouTube; music version id: "mHpTdsBbYRM".
     To use your own file instead, put it in music/ and set src, e.g. "music/barakallah.mp3". */
  music: {
    src: "",
    youtubeId: "61C6FxprHuY",
    /* Seconds to skip — this video is silent for its first ~8.5s */
    startAt: 8.5,
    volume: 70,
  },
};
