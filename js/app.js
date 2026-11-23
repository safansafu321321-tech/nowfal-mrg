(function () {
  "use strict";

  const W = window.WEDDING;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const enc = encodeURIComponent;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const isSmall = window.innerWidth < 760;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const params = new URLSearchParams(location.search);
  if (params.has("host")) {
    location.replace("/share");
    return;
  }
  const guest = (params.get("to") || params.get("guest") || "").trim().slice(0, 60);

  /* ---------------------------------------------------------
     Personal guest name (?to=Name)
     --------------------------------------------------------- */
  function applyGuest() {
    if (!guest) return;

    const gate = $("#gate-guest");
    gate.textContent = "Assalamu Alaikum";
    const g1 = document.createElement("strong");
    g1.textContent = guest;
    gate.appendChild(g1);

    const line = $("#guest-line");
    line.textContent = "Dear";
    const g2 = document.createElement("strong");
    g2.textContent = guest;
    line.appendChild(g2);
    line.appendChild(document.createTextNode("your name is in our heart — you & your family are invited."));

    document.title = `${guest}, you're invited — Nowfal & Shibna`;
  }

  /* ---------------------------------------------------------
     Gate star field
     --------------------------------------------------------- */
  function starField(canvas) {
    const ctx = canvas.getContext("2d");
    const ratio = Math.min(DPR, 2);
    let w = 0, h, stars, shooting = null, raf, running = true;

    function resize() {
      const nw = canvas.parentElement.clientWidth;
      const nh = canvas.parentElement.clientHeight;
      if (nw === w && nh <= h) return;
      w = nw;
      h = nh;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(220, Math.floor((w * h) / 3500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.2,
        t: Math.random() * Math.PI * 2,
        s: Math.random() * 0.03 + 0.008,
      }));
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        st.t += st.s;
        const a = 0.35 + Math.sin(st.t) * 0.35 + 0.3;
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = st.r > 1.1 ? "#f6e3a8" : "#ffffff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!shooting && Math.random() < 0.006) {
        shooting = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.35, l: 0, v: 9 + Math.random() * 5 };
      }
      if (shooting) {
        shooting.l += shooting.v;
        const x = shooting.x + shooting.l;
        const y = shooting.y + shooting.l * 0.45;
        const grad = ctx.createLinearGradient(x - 90, y - 40, x, y);
        grad.addColorStop(0, "rgba(246,227,168,0)");
        grad.addColorStop(1, "rgba(255,250,230,0.95)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x - 90, y - 40);
        ctx.lineTo(x, y);
        ctx.stroke();
        if (x > w + 100 || y > h + 100) shooting = null;
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    frame();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  /* ---------------------------------------------------------
     Floating gold dust (whole site)
     --------------------------------------------------------- */
  function goldDust(canvas) {
    const ctx = canvas.getContext("2d");
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const sctx = sprite.getContext("2d");
    const g = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,248,220,1)");
    g.addColorStop(0.3, "rgba(246,227,168,0.8)");
    g.addColorStop(1, "rgba(216,180,92,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 32, 32);

    const ratio = Math.min(DPR, 1.5);
    let w = 0, h = 0, parts;
    const count = isSmall ? 26 : 48;

    function spawn(randomY) {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 20,
        size: Math.random() * 10 + 4,
        vy: -(Math.random() * 0.35 + 0.12),
        drift: Math.random() * Math.PI * 2,
        tw: Math.random() * Math.PI * 2,
      };
    }

    // Mobile URL bars fire resize while scrolling: only rebuild on real width changes.
    function resize() {
      const nw = window.innerWidth;
      const rebuild = nw !== w;
      const nh = rebuild ? window.innerHeight : Math.max(window.innerHeight, h);
      if (!rebuild && nh === h) return;
      w = nw;
      h = nh;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (rebuild || !parts) parts = Array.from({ length: count }, () => spawn(true));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.y += p.vy;
        p.drift += 0.01;
        p.tw += 0.04;
        p.x += Math.sin(p.drift) * 0.3;
        if (p.y < -20) parts[i] = spawn(false);
        ctx.globalAlpha = 0.25 + (Math.sin(p.tw) + 1) * 0.3;
        ctx.drawImage(sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    frame();
  }

  /* ---------------------------------------------------------
     Petals
     --------------------------------------------------------- */
  const petalBox = $("#petals");
  function petal(burst) {
    if (document.hidden) return;
    const el = document.createElement("span");
    el.className = "petal" + (Math.random() < 0.35 ? " gold" : "");
    const size = 0.6 + Math.random() * 0.8;
    el.style.left = Math.random() * 100 + "vw";
    el.style.transform = `scale(${size})`;
    el.style.setProperty("--dx", (Math.random() * 200 - 100).toFixed(0) + "px");
    el.style.setProperty("--rot", (Math.random() * 720 - 360).toFixed(0) + "deg");
    el.style.animationDuration = (burst ? 4 + Math.random() * 3 : 8 + Math.random() * 6).toFixed(1) + "s";
    if (burst) el.style.animationDelay = (Math.random() * 1.2).toFixed(2) + "s";
    el.addEventListener("animationend", () => el.remove());
    petalBox.appendChild(el);
  }

  function startPetals() {
    for (let i = 0; i < (isSmall ? 26 : 45); i++) petal(true);
    setInterval(() => petal(false), isSmall ? 1600 : 1100);
  }

  /* ---------------------------------------------------------
     Hearts rising around the couple illustration
     --------------------------------------------------------- */
  function initStageHearts() {
    if (reduceMotion) return;
    const box = $("#stage-hearts");
    let timer = null;

    function heart() {
      if (document.hidden) return;
      const h = document.createElement("span");
      h.className = "heart" + (Math.random() < 0.4 ? " gold" : "");
      h.textContent = "❤";
      h.style.left = 5 + Math.random() * 90 + "%";
      h.style.fontSize = 10 + Math.random() * 14 + "px";
      h.style.setProperty("--hx", (Math.random() * 40 - 20).toFixed(0) + "px");
      h.style.setProperty("--rise", box.clientHeight + "px");
      h.style.animationDuration = (4 + Math.random() * 3).toFixed(1) + "s";
      h.addEventListener("animationend", () => h.remove());
      box.appendChild(h);
    }

    new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !timer) timer = setInterval(heart, 700);
      if (!visible && timer) {
        clearInterval(timer);
        timer = null;
      }
    }).observe($("#stage"));
  }

  /* ---------------------------------------------------------
     Journey scene: plays by itself when it comes into view,
     resets once fully off-screen so it replays on return
     --------------------------------------------------------- */
  function initJourney() {
    const scene = $("#journey");
    if (reduceMotion) {
      scene.classList.add("on", "play", "met");
      return;
    }
    const WALK_MS = 3200;
    let timer = 0;

    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.45 && !scene.classList.contains("play")) {
            scene.classList.add("on", "play", "moving");
            clearTimeout(timer);
            timer = setTimeout(() => {
              scene.classList.remove("moving");
              scene.classList.add("met");
            }, WALK_MS);
          } else if (!entry.isIntersecting) {
            clearTimeout(timer);
            scene.classList.remove("on", "play", "moving", "met");
          }
        });
      },
      { threshold: [0, 0.45] }
    ).observe(scene);
  }

  /* ---------------------------------------------------------
     Sparkles on tap / cursor
     --------------------------------------------------------- */
  function sparkle(x, y, n) {
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "sparkle";
      const ang = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 40;
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.setProperty("--sx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--sy", Math.sin(ang) * dist + "px");
      const sc = 0.5 + Math.random() * 0.9;
      s.style.width = s.style.height = 10 * sc + "px";
      s.addEventListener("animationend", () => s.remove());
      document.body.appendChild(s);
    }
  }

  function initSparkles() {
    if (reduceMotion) return;
    document.addEventListener("pointerdown", (e) => sparkle(e.clientX, e.clientY, 9));
    if (finePointer) {
      let last = 0;
      document.addEventListener("pointermove", (e) => {
        const now = performance.now();
        if (now - last < 70) return;
        last = now;
        sparkle(e.clientX, e.clientY, 1);
      });
    }
  }

  /* ---------------------------------------------------------
     Hero mandala
     --------------------------------------------------------- */
  function buildMandala() {
    const svg = $("#mandala");
    const NS = "http://www.w3.org/2000/svg";
    const make = (tag, attrs, parent) => {
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      el.setAttribute("class", "draw");
      el.setAttribute("pathLength", "1");
      parent.appendChild(el);
      return el;
    };
    const group = () => svg.appendChild(document.createElementNS(NS, "g"));

    const outer = group();
    make("circle", { cx: 200, cy: 200, r: 196 }, outer);
    make("circle", { cx: 200, cy: 200, r: 186 }, outer);
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      make("circle", { cx: 200 + Math.cos(a) * 191, cy: 200 + Math.sin(a) * 191, r: 2.5 }, outer);
    }

    const petals = group();
    for (let i = 0; i < 16; i++) {
      make("ellipse", { cx: 200, cy: 92, rx: 17, ry: 56, transform: `rotate(${i * 22.5} 200 200)` }, petals);
    }

    const inner = group();
    for (let i = 0; i < 4; i++) {
      make("rect", { x: 100, y: 100, width: 200, height: 200, transform: `rotate(${i * 22.5} 200 200)` }, inner);
    }
    make("circle", { cx: 200, cy: 200, r: 150 }, inner);
    make("circle", { cx: 200, cy: 200, r: 70 }, inner);
  }

  /* ---------------------------------------------------------
     Word-by-word text
     --------------------------------------------------------- */
  function splitWords() {
    $$(".words").forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      words.forEach((word, i) => {
        const span = document.createElement("span");
        span.className = "w";
        span.style.setProperty("--i", i);
        span.textContent = word;
        el.appendChild(span);
        el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ---------------------------------------------------------
     Scroll reveals, progress, parallax, dock
     --------------------------------------------------------- */
  function initScroll() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));

    const dockLinks = $$(".dock a");
    const dockMap = { home: "home", invite: "home", couple: "couple", journey: "couple", events: "events", countdown: "events", venue: "venue", blessing: "venue", contact: "contact", footer: "contact" };
    const secIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const key = dockMap[entry.target.id];
          dockLinks.forEach((a) => a.classList.toggle("active", a.dataset.sec === key));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(dockMap).forEach((id) => {
      const el = document.getElementById(id);
      if (el) secIO.observe(el);
    });

    const bar = $("#progress-bar");
    const fill = $("#timeline-fill");
    const timeline = $(".timeline");
    const parallax = $$("[data-parallax]");
    let ticking = false;

    // Layout is measured only on load/resize; the scroll handler does pure math + transform writes.
    let vh, max, tlTop, tlHeight, layers;
    function measure() {
      vh = window.innerHeight;
      const y = window.scrollY;
      max = document.documentElement.scrollHeight - vh;
      const tr = timeline.getBoundingClientRect();
      tlTop = tr.top + y;
      tlHeight = tr.height;
      layers = parallax.map((el) => {
        const r = el.parentElement.getBoundingClientRect();
        return { el, top: r.top + y, bottom: r.bottom + y, k: parseFloat(el.dataset.parallax) * 0.4, last: null };
      });
    }

    function update() {
      ticking = false;
      const y = window.scrollY;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

      const p = Math.min(1, Math.max(0, (vh * 0.75 - (tlTop - y)) / tlHeight));
      fill.style.transform = `scaleY(${p.toFixed(4)})`;

      if (!reduceMotion) {
        for (const l of layers) {
          if (l.bottom < y || l.top > y + vh) continue;
          const v = (-(l.top - y) * l.k).toFixed(1);
          if (v === l.last) continue;
          l.last = v;
          l.el.style.transform = `translate3d(0, ${v}px, 0)`;
        }
      }
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    let lastW = window.innerWidth;
    const remeasure = () => {
      measure();
      update();
    };
    window.addEventListener("resize", () => {
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - vh) < 120) return;
      lastW = window.innerWidth;
      remeasure();
    });
    window.addEventListener("load", remeasure);
    if (document.fonts) document.fonts.ready.then(remeasure);
    if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(document.body);
    remeasure();
  }

  /* ---------------------------------------------------------
     3D tilt on event cards
     --------------------------------------------------------- */
  function initTilt() {
    if (!finePointer || reduceMotion) return;
    $$("[data-tilt] .event-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 10}deg) translateY(-4px)`;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     Countdown
     --------------------------------------------------------- */
  function initCountdown() {
    const target = new Date(W.countdownTo).getTime();
    const cells = {};
    $$(".count-cell").forEach((c) => {
      cells[c.dataset.unit] = { num: $("strong", c), ring: $(".ring", c), last: null };
    });

    function set(unit, value, fraction, pad) {
      const cell = cells[unit];
      const text = String(value).padStart(pad, "0");
      if (cell.last !== text) {
        cell.num.textContent = text;
        cell.num.classList.remove("tick");
        void cell.num.offsetWidth;
        cell.num.classList.add("tick");
        cell.last = text;
      }
      cell.ring.style.strokeDashoffset = String(1 - fraction);
    }

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        $("#count-grid").hidden = true;
        $("#count-done").hidden = false;
        return;
      }
      const s = Math.floor(diff / 1000);
      const days = Math.floor(s / 86400);
      const hours = Math.floor((s % 86400) / 3600);
      const mins = Math.floor((s % 3600) / 60);
      const secs = s % 60;
      set("days", days, Math.min(1, days / 365), 2);
      set("hours", hours, hours / 24, 2);
      set("mins", mins, mins / 60, 2);
      set("secs", secs, secs / 60, 2);
      setTimeout(tick, 1000 - (Date.now() % 1000));
    }
    tick();
  }

  /* ---------------------------------------------------------
     Maps & calendar
     --------------------------------------------------------- */
  const mapsLink = (ev) => ev.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${enc(ev.mapsQuery)}`;
  const mapsEmbed = (ev) => `https://maps.google.com/maps?q=${enc(ev.mapsQuery)}&z=15&output=embed`;
  const toUTC = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  function initMaps() {
    $$("[data-maps]").forEach((a) => {
      a.href = mapsLink(W.events[a.dataset.maps]);
    });

    const frame = $("#map-frame");
    const open = $("#map-open");
    const tabs = $$(".venue-tabs button");

    function show(key) {
      const ev = W.events[key];
      tabs.forEach((t) => {
        const on = t.dataset.venue === key;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      frame.classList.add("loading");
      frame.onload = () => frame.classList.remove("loading");
      frame.src = mapsEmbed(ev);
      frame.title = `Map — ${ev.place}`;
      open.href = mapsLink(ev);
    }

    tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.venue)));

    // Defer the map iframe until the venue section is near.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show("nikah");
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe($("#venue"));
    open.href = mapsLink(W.events.nikah);
  }

  function initCalendar() {
    const details = "Wedding of Nowfal P.E. with Shibna Nasreen K.A. — Your presence and prayers will make this blessed occasion even more special.";

    $$("[data-cal]").forEach((a) => {
      const ev = W.events[a.dataset.cal];
      a.href =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        `&text=${enc(ev.title)}` +
        `&dates=${toUTC(ev.start)}/${toUTC(ev.end)}` +
        `&details=${enc(details)}` +
        `&location=${enc(ev.place)}`;
    });

    const esc = (s) => s.replace(/([,;\\])/g, "\\$1");
    const stamp = toUTC(new Date().toISOString());
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nowfal & Shibna//Wedding//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    Object.entries(W.events).forEach(([key, ev]) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${key}-20261217@nowfal-shibna`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${toUTC(ev.start)}`,
        `DTEND:${toUTC(ev.end)}`,
        `SUMMARY:${esc(ev.title)}`,
        `LOCATION:${esc(ev.place)}`,
        `DESCRIPTION:${esc(details)}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT3H",
        "ACTION:DISPLAY",
        `DESCRIPTION:${esc(ev.title)}`,
        "END:VALARM",
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    $("#ics-btn").href = URL.createObjectURL(blob);
  }

  /* ---------------------------------------------------------
     Contact, WhatsApp, share, host tool
     --------------------------------------------------------- */
  function toast(msg) {
    let t = $(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2400);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast("Link copied ✓");
  }

  function initContact() {
    $$("[data-phone]").forEach((a) => {
      const num = W.phones[+a.dataset.phone];
      a.href = `tel:+91${num}`;
      $("b", a).textContent = num.replace(/(\d{5})(\d{5})/, "$1 $2");
    });

    const from = guest ? `\n\n— ${guest}` : "";
    $("#wa-btn").href =
      `https://wa.me/${W.whatsapp}?text=` +
      enc(`Assalamu Alaikum Nowfal! 🌙\nCongratulations on your wedding. May Allah bless you both and unite you in goodness. In shaa Allah, we will be there!${from}`);

    $("#share-btn").addEventListener("click", async () => {
      const data = {
        title: "Nowfal & Shibna — Wedding Invitation",
        text: "You're invited to the wedding of Nowfal & Shibna · Thursday, 17 December 2026 · Gonikoppal",
        url: location.origin + location.pathname,
      };
      if (navigator.share) {
        try {
          await navigator.share(data);
        } catch {
          /* user cancelled */
        }
      } else {
        copy(data.url);
      }
    });
  }

  /* ---------------------------------------------------------
     Background nasheed (no on-screen control)
     --------------------------------------------------------- */
  function pauseWhileHidden(pause, resume, isPlaying) {
    let resumeLater = false;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        resumeLater = isPlaying();
        if (resumeLater) pause();
      } else if (resumeLater) {
        resumeLater = false;
        resume();
      }
    });
  }

  function initMusic() {
    const cfg = W.music || {};
    const volume = cfg.volume ?? 70;

    if (cfg.src) {
      const audio = $("#bg-music");
      const startAt = cfg.startAt || 0;
      audio.src = cfg.src;
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = volume / 100;
      try {
        audio.load();
      } catch (_) {
        /* ignore */
      }
      const play = () => {
        try {
          if (startAt && audio.currentTime < startAt) audio.currentTime = startAt;
        } catch (_) {
          /* ignore seek before metadata */
        }
        return audio.play().catch(() => {});
      };
      pauseWhileHidden(() => audio.pause(), play, () => !audio.paused);
      return play;
    }

    if (!cfg.youtubeId) return () => {};

    const startAt = cfg.startAt || 0;
    let player = null;
    let ready = false;
    let wanted = false;
    let resumeTimer = 0;

    const start = () => {
      if (!player) return;
      clearTimeout(resumeTimer);
      player.seekTo(startAt, true);
      player.unMute();
      player.setVolume(volume);
      player.playVideo();
    };

    const keepPlaying = () => {
      if (!wanted || !ready || !player || document.hidden) return;
      const state = player.getPlayerState();
      if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.CUED) {
        player.playVideo();
      }
    };

    window.onYouTubeIframeAPIReady = () => {
      player = new YT.Player("yt-player", {
        videoId: cfg.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          start: Math.floor(startAt),
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            ready = true;
            if (wanted) {
              start();
            } else {
              // Buffer silently so the nasheed starts the instant the seal is tapped.
              player.mute();
              player.playVideo();
            }
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              player.seekTo(startAt, true);
              player.playVideo();
              return;
            }
            // YouTube often pauses “hidden” embeds; nudge playback back on.
            if (e.data === YT.PlayerState.PAUSED && wanted && !document.hidden) {
              clearTimeout(resumeTimer);
              resumeTimer = setTimeout(keepPlaying, 120);
            }
          },
        },
      });
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    pauseWhileHidden(
      () => {
        clearTimeout(resumeTimer);
        if (player) player.pauseVideo();
      },
      () => {
        if (player) player.playVideo();
      },
      () => ready && player && player.getPlayerState() === YT.PlayerState.PLAYING
    );

    return () => {
      wanted = true;
      if (ready) start();
    };
  }

  /* ---------------------------------------------------------
     Opening sequence
     --------------------------------------------------------- */
  function initGate() {
    const gate = $("#gate");
    const btn = $("#open-btn");
    const stopStars = starField($("#gate-stars"));
    const playMusic = initMusic();
    let opened = false;

    const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

    btn.addEventListener("click", async () => {
      if (opened) return;
      opened = true;
      playMusic();

      const r = btn.getBoundingClientRect();
      if (!reduceMotion) sparkle(r.left + r.width / 2, r.top + r.height / 2, 24);

      gate.classList.add("s-seal");
      await wait(450);
      gate.classList.add("s-doors");
      if (!reduceMotion) startPetals();
      await wait(2400);
      gate.classList.add("s-zoom");
      await wait(900);

      window.scrollTo(0, 0);
      document.body.classList.remove("locked");
      document.body.classList.add("revealed");
      $("#site").removeAttribute("aria-hidden");
      $("#dock").hidden = false;
      gate.classList.add("gone");
      if (!reduceMotion) goldDust($("#dust"));

      await wait(1100);
      stopStars();
      gate.remove();
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  applyGuest();
  buildMandala();
  splitWords();
  initGate();
  initScroll();
  initTilt();
  initStageHearts();
  initJourney();
  initCountdown();
  initMaps();
  initCalendar();
  initContact();
  initSparkles();
})();
