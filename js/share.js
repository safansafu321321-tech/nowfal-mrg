(function () {
  "use strict";

  const W = window.WEDDING;
  const $ = (sel) => document.querySelector(sel);
  const enc = encodeURIComponent;
  const SITE = W.siteUrl || location.origin + "/";
  const STORE = "nowfal-invites";

  const linkFor = (name) => `${SITE}?to=${enc(name)}`;

  const messageFor = (name, url) =>
    `Assalamu Alaikum ${name} 🌙\n\n` +
    `You and your family are warmly invited to the wedding of *Nowfal & Shibna* on Thursday, 17 December 2026 at Gonikoppal, In shaa Allah.\n\n` +
    `• Nikah — 10:00 AM, Shafi Muslim Jumma Masjid\n` +
    `• Reception — 12:00 PM, Parimala Mangal Vihar\n\n` +
    `Open your invitation 💌\n${url}`;

  // Accepts 10-digit Indian numbers with or without +91 / 0 prefix.
  function cleanPhone(raw) {
    let d = (raw || "").replace(/\D/g, "");
    if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    if (d.length === 10) return "91" + d;
    if (d.length === 12 && d.startsWith("91")) return d;
    return d.length >= 10 ? d : "";
  }

  function waUrl(phone, text) {
    return `https://wa.me/${phone || ""}?text=${enc(text)}`;
  }

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
    t._h = setTimeout(() => t.classList.remove("show"), 2200);
  }

  async function copy(text, msg) {
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
    toast(msg || "Copied ✓");
  }

  /* ---------- recent list (kept on this phone only) ---------- */
  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || [];
    } catch {
      return [];
    }
  };
  const save = (list) => localStorage.setItem(STORE, JSON.stringify(list.slice(0, 300)));

  function remember(name, phone) {
    const list = load().filter((r) => r.name.toLowerCase() !== name.toLowerCase());
    list.unshift({ name, phone, at: Date.now() });
    save(list);
    renderRecent();
  }

  function renderRecent() {
    const list = load();
    $("#recent-card").hidden = list.length === 0;
    $("#recent-count").textContent = `(${list.length})`;
    const ul = $("#recent");
    ul.textContent = "";
    list.forEach((r) => {
      const li = document.createElement("li");
      const info = document.createElement("div");
      const n = document.createElement("strong");
      n.textContent = r.name;
      const meta = document.createElement("small");
      const when = new Date(r.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
      meta.textContent = (r.phone ? `+${r.phone} · ` : "") + when;
      info.append(n, meta);

      const again = document.createElement("a");
      again.className = "recent-btn wa";
      again.textContent = "Resend";
      again.target = "_blank";
      again.rel = "noopener";
      again.href = waUrl(r.phone, messageFor(r.name, linkFor(r.name)));

      const cp = document.createElement("button");
      cp.type = "button";
      cp.className = "recent-btn";
      cp.textContent = "Copy";
      cp.addEventListener("click", () => copy(linkFor(r.name), "Link copied ✓"));

      li.append(info, again, cp);
      ul.appendChild(li);
    });
  }

  /* ---------- form ---------- */
  let current = null;

  function refreshSend() {
    if (!current) return;
    $("#send-wa").href = waUrl(current.phone, $("#out-msg").value);
  }

  $("#share-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#guest-name").value.trim().replace(/\s+/g, " ");
    if (!name) return;
    const phone = cleanPhone($("#guest-phone").value);
    const url = linkFor(name);
    current = { name, phone, url };

    $("#out-name").textContent = name;
    $("#out-link").textContent = url;
    $("#out-link").href = url;
    $("#out-msg").value = messageFor(name, url);
    $("#send-wa-label").textContent = phone ? `Send to +${phone}` : "Send on WhatsApp";
    refreshSend();

    const out = $("#share-out");
    out.hidden = false;
    out.classList.remove("pop");
    void out.offsetWidth;
    out.classList.add("pop");
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $("#out-msg").addEventListener("input", refreshSend);

  $("#send-wa").addEventListener("click", () => {
    if (current) remember(current.name, current.phone);
  });

  $("#native-share").addEventListener("click", async () => {
    if (!current) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Nowfal & Shibna — Wedding Invitation", text: $("#out-msg").value });
        remember(current.name, current.phone);
      } catch {
        /* cancelled */
      }
    } else {
      copy($("#out-msg").value, "Message copied ✓");
      remember(current.name, current.phone);
    }
  });

  $("#copy-link").addEventListener("click", () => {
    if (!current) return;
    copy(current.url, "Link copied ✓");
    remember(current.name, current.phone);
  });

  $("#copy-msg").addEventListener("click", () => {
    if (!current) return;
    copy($("#out-msg").value, "Message copied ✓");
    remember(current.name, current.phone);
  });

  $("#next-guest").addEventListener("click", () => {
    current = null;
    $("#share-out").hidden = true;
    $("#share-form").reset();
    $("#guest-name").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#copy-general").addEventListener("click", () => copy(SITE, "Link copied ✓"));
  $("#open-general").href = SITE;

  $("#recent-clear").addEventListener("click", () => {
    if (!confirm("Clear the list of sent invitations on this phone?")) return;
    localStorage.removeItem(STORE);
    renderRecent();
  });

  renderRecent();
})();
