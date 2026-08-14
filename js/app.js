(function () {
  const cfg = window.WEDDING;
  const gallery = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fe9e0f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e91ce1b56?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1529636798458-92182e662530?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1400&q=80",
  ];

  const eventPhotos = [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
  ];

  window.addEventListener("load", () => {
    document.getElementById("preloader").classList.add("hide");
  });

  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });

  const nav = document.getElementById("nav");
  document.getElementById("navToggle").addEventListener("click", () => {
    nav.classList.toggle("open");
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );

  const slides = [...document.querySelectorAll(".hero-slide")];
  const dotsWrap = document.getElementById("heroDots");
  let slideIndex = 0;
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.addEventListener("click", () => goSlide(i));
    dotsWrap.appendChild(b);
  });
  function goSlide(i) {
    slides[slideIndex].classList.remove("active");
    slideIndex = (i + slides.length) % slides.length;
    slides[slideIndex].classList.add("active");
    [...dotsWrap.children].forEach((d, idx) => d.classList.toggle("active", idx === slideIndex));
  }
  goSlide(0);
  document.getElementById("heroPrev").onclick = () => goSlide(slideIndex - 1);
  document.getElementById("heroNext").onclick = () => goSlide(slideIndex + 1);
  setInterval(() => goSlide(slideIndex + 1), 5500);

  document.querySelectorAll(".see-more").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = btn.closest(".bio");
      p.innerHTML = p.dataset.full;
    });
  });

  function pad(n) {
    return String(n).padStart(2, "0");
  }
  const target = new Date(cfg.weddingDate).getTime();
  function tick() {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById("d").textContent = pad(d);
    document.getElementById("h").textContent = pad(h);
    document.getElementById("m").textContent = pad(m);
    document.getElementById("s").textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  const eventList = document.getElementById("eventList");
  cfg.events.forEach((ev, i) => {
    const start = ev.date.replace(/-/g, "") + "T" + ev.time.replace(":", "") + "00";
    const gcal =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(ev.title + " (Đám cưới Hải và Thảo)") +
      "&dates=" + start + "/" + start +
      "&location=" + encodeURIComponent(ev.address) +
      "&ctz=Asia/Ho_Chi_Minh";
    eventList.innerHTML += `
      <article class="event-card">
        <h3>${ev.title}</h3>
        <div class="row">
          <img src="${eventPhotos[i] || eventPhotos[0]}" alt="${ev.title}">
          <div>
            <ul class="meta">
              <li><i class="fa fa-calendar-check-o"></i>${ev.date}</li>
              <li><i class="fa fa-clock-o"></i> ${ev.time}</li>
            </ul>
            <p class="place"><i class="fa fa-map-marker"></i> ${ev.placeLabel} — ${ev.address}</p>
            <a href="${ev.map}" target="_blank" rel="noopener">Xem bản đồ <i class="fa fa-caret-right"></i></a>
            <div><a class="cal-btn" href="${gcal}" target="_blank" rel="noopener">Thêm vào lịch</a></div>
          </div>
        </div>
      </article>`;
  });

  const grid = document.getElementById("galleryGrid");
  const preview = 9;
  gallery.forEach((src, i) => {
    const item = document.createElement("div");
    item.className = "gallery-item" + (i >= preview ? " hidden extra" : "");
    item.innerHTML = `<img src="${src}" alt="Album ${i + 1}"><i class="fa fa-search"></i>`;
    item.addEventListener("click", () => openLb(i));
    grid.appendChild(item);
  });
  const moreBtn = document.getElementById("btnMoreGallery");
  moreBtn.addEventListener("click", () => {
    document.querySelectorAll(".gallery-item.extra").forEach((el) => el.classList.remove("hidden"));
    moreBtn.style.display = "none";
  });

  let lbIndex = 0;
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  function openLb(i) {
    lbIndex = i;
    lbImg.src = gallery[lbIndex];
    lightbox.classList.add("open");
  }
  function closeLb() {
    lightbox.classList.remove("open");
  }
  document.getElementById("lbClose").onclick = closeLb;
  document.getElementById("lbPrev").onclick = () => openLb((lbIndex - 1 + gallery.length) % gallery.length);
  document.getElementById("lbNext").onclick = () => openLb((lbIndex + 1) % gallery.length);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLb();
  });

  const KEY = "haithao-wishes";
  const seed = [
    { name: "Bạn thân", content: "Chúc mừng hạnh phúc Hải & Thảo. Trăm năm hạnh phúc nhé!" },
    { name: "Gia đình", content: "Chúc hai con luôn yêu thương, thuận hòa và sớm xây tổ ấm đầm ấm." },
  ];
  function loadWishes() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || seed;
    } catch {
      return seed;
    }
  }
  function saveWishes(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  function renderWishes() {
    const box = document.getElementById("wishBox");
    box.innerHTML = loadWishes()
      .map(
        (w) => `<div class="wish-item"><strong>${escapeHtml(w.name)}</strong><p>${escapeHtml(w.content)}</p></div>`
      )
      .join("");
  }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  renderWishes();

  const suggestBox = document.getElementById("suggestBox");
  suggestBox.innerHTML = cfg.suggestions
    .map((s) => `<button type="button">${escapeHtml(s)}</button>`)
    .join("");
  document.getElementById("btnSuggest").addEventListener("click", () => {
    suggestBox.classList.toggle("open");
  });
  suggestBox.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      document.getElementById("wishContent").value = e.target.textContent;
      suggestBox.classList.remove("open");
    }
  });

  document.getElementById("wishForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = String(fd.get("name") || "").trim();
    const content = String(fd.get("content") || "").trim();
    if (!name || !content) return;
    const list = loadWishes();
    list.unshift({ name, content });
    saveWishes(list);
    renderWishes();
    e.target.reset();
    document.getElementById("formMsg").textContent = "Cảm ơn bạn đã gửi lời chúc!";
  });

  const giftGrid = document.getElementById("giftGrid");
  cfg.gifts.forEach((g) => {
    const qr =
      "https://img.vietqr.io/image/" +
      g.bin +
      "-" +
      encodeURIComponent(g.account) +
      "-compact2.png?accountName=" +
      encodeURIComponent(g.name);
    giftGrid.innerHTML += `
      <div class="gift-card">
        <span>${g.side}</span>
        <p><strong>${g.name}</strong></p>
        <p>${g.bank}</p>
        <p>${g.account}</p>
        <img class="qr" src="${qr}" alt="QR ${g.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'qr',textContent:'QR ngân hàng'}))">
        <button class="copy-acc" data-acc="${g.account}" type="button">Sao chép STK</button>
      </div>`;
  });
  giftGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-acc");
    if (!btn) return;
    navigator.clipboard.writeText(btn.dataset.acc).then(() => {
      btn.textContent = "Đã sao chép";
      setTimeout(() => (btn.textContent = "Sao chép STK"), 1500);
    });
  });
  const giftModal = document.getElementById("giftModal");
  document.getElementById("btnGift").onclick = () => giftModal.classList.add("open");
  document.getElementById("giftClose").onclick = () => giftModal.classList.remove("open");
  giftModal.addEventListener("click", (e) => {
    if (e.target === giftModal) giftModal.classList.remove("open");
  });

  const audio = document.getElementById("bgMusic");
  audio.src = "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=romantic-vibe-110673.mp3";
  const btnMusic = document.getElementById("btnMusic");
  btnMusic.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      btnMusic.classList.add("playing");
    } else {
      audio.pause();
      btnMusic.classList.remove("playing");
    }
  });

  const hearts = document.getElementById("hearts");
  setInterval(() => {
    const el = document.createElement("span");
    el.className = "fall-heart";
    el.textContent = "♥";
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = 10 + Math.random() * 16 + "px";
    el.style.animationDuration = 6 + Math.random() * 6 + "s";
    hearts.appendChild(el);
    setTimeout(() => el.remove(), 12000);
  }, 700);
})();
