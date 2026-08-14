(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  }

  function setHtml(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value || "";
  }

  function setSrc(id, value, alt) {
    const el = document.getElementById(id);
    if (!el) return;
    el.src = value || "";
    if (alt) el.alt = alt;
  }

  function setBg(id, url) {
    const el = document.getElementById(id);
    if (el && url) el.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')";
  }

  function shortBio(text) {
    if (!text) return "";
    return text.length > 90 ? text.slice(0, 90) + "..." : text;
  }

  function bindBio(id, full) {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.full = full || "";
    el.innerHTML =
      escapeHtml(shortBio(full)) +
      (full && full.length > 90
        ? ' <button class="see-more" type="button">Xem thêm <i class="fa fa-angle-down"></i></button>'
        : "");
    const btn = el.querySelector(".see-more");
    if (btn) {
      btn.addEventListener("click", () => {
        el.textContent = el.dataset.full;
      });
    }
  }

  WeddingStore.load().then((cfg) => {
    render(cfg);
  });

  function render(cfg) {
    document.title = cfg.site.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", cfg.site.description);
    setHtml(
      "logo",
      escapeHtml(cfg.site.logoLeft) + '<span class="heart">♥</span>' + escapeHtml(cfg.site.logoRight)
    );

    setText("heroTagline", cfg.hero.tagline);
    setHtml(
      "heroNames",
      "<span>" +
        escapeHtml(cfg.couple.groom.name) +
        "</span> &amp; <span>" +
        escapeHtml(cfg.couple.bride.name) +
        "</span>"
    );
    setText("saveDateLabel", cfg.hero.saveTheDateLabel);
    setText("saveDateValue", cfg.countdown.dateLabel);

    const slidesWrap = document.getElementById("heroSlides");
    const dotsWrap = document.getElementById("heroDots");
    slidesWrap.innerHTML = "";
    dotsWrap.innerHTML = "";
    (cfg.hero.slides || []).forEach((src, i) => {
      const slide = document.createElement("div");
      slide.className = "hero-slide" + (i === 0 ? " active" : "");
      slide.style.backgroundImage = "url('" + src.replace(/'/g, "\\'") + "')";
      slidesWrap.appendChild(slide);
      const dot = document.createElement("button");
      if (i === 0) dot.className = "active";
      dotsWrap.appendChild(dot);
    });

    const slides = [...document.querySelectorAll(".hero-slide")];
    let slideIndex = 0;
    function goSlide(i) {
      if (!slides.length) return;
      slides[slideIndex].classList.remove("active");
      slideIndex = (i + slides.length) % slides.length;
      slides[slideIndex].classList.add("active");
      [...dotsWrap.children].forEach((d, idx) => d.classList.toggle("active", idx === slideIndex));
    }
    [...dotsWrap.children].forEach((d, i) => d.addEventListener("click", () => goSlide(i)));
    document.getElementById("heroPrev").onclick = () => goSlide(slideIndex - 1);
    document.getElementById("heroNext").onclick = () => goSlide(slideIndex + 1);
    if (slides.length > 1) setInterval(() => goSlide(slideIndex + 1), 5500);

    setText("coupleTitle", cfg.couple.title);
    setSrc("groomPhoto", cfg.couple.groom.photo, cfg.couple.groom.role + " " + cfg.couple.groom.name);
    setText("groomRole", cfg.couple.groom.role);
    setText("groomName", cfg.couple.groom.name);
    setText("groomFather", cfg.couple.groom.father);
    setText("groomMother", cfg.couple.groom.mother);
    bindBio("groomBio", cfg.couple.groom.bio);
    setSrc("bridePhoto", cfg.couple.bride.photo, cfg.couple.bride.role + " " + cfg.couple.bride.name);
    setText("brideRole", cfg.couple.bride.role);
    setText("brideName", cfg.couple.bride.name);
    setText("brideFather", cfg.couple.bride.father);
    setText("brideMother", cfg.couple.bride.mother);
    bindBio("brideBio", cfg.couple.bride.bio);
    document.getElementById("wishBtn").innerHTML =
      '<i class="fa fa-pencil-square-o"></i> ' + escapeHtml(cfg.couple.wishButton);

    setText("countdownTitle", cfg.countdown.title);
    setBg("countdownBand", cfg.countdown.background);

    function pad(n) {
      return String(n).padStart(2, "0");
    }
    const target = new Date(cfg.countdown.datetime).getTime();
    function tick() {
      const diff = Math.max(0, target - Date.now());
      document.getElementById("d").textContent = pad(Math.floor(diff / 86400000));
      document.getElementById("h").textContent = pad(Math.floor((diff % 86400000) / 3600000));
      document.getElementById("m").textContent = pad(Math.floor((diff % 3600000) / 60000));
      document.getElementById("s").textContent = pad(Math.floor((diff % 60000) / 1000));
    }
    tick();
    setInterval(tick, 1000);

    setText("eventsTitle", cfg.events.title);
    setSrc("eventsBanner", cfg.events.banner, cfg.events.title);
    const eventList = document.getElementById("eventList");
    eventList.innerHTML = "";
    (cfg.events.items || []).forEach((ev) => {
      const start = String(ev.date || "").replace(/-/g, "") + "T" + String(ev.time || "00:00").replace(":", "") + "00";
      const gcal =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" +
        encodeURIComponent(ev.title + " (Đám cưới " + cfg.couple.groom.name + " và " + cfg.couple.bride.name + ")") +
        "&dates=" +
        start +
        "/" +
        start +
        "&location=" +
        encodeURIComponent(ev.address || "") +
        "&ctz=Asia/Ho_Chi_Minh";
      eventList.innerHTML += `
        <article class="event-card">
          <h3>${escapeHtml(ev.title)}</h3>
          <div class="row">
            <img src="${escapeHtml(ev.image || "")}" alt="${escapeHtml(ev.title)}">
            <div>
              <ul class="meta">
                <li><i class="fa fa-calendar-check-o"></i>${escapeHtml(ev.date)}</li>
                <li><i class="fa fa-clock-o"></i> ${escapeHtml(ev.time)}</li>
              </ul>
              <p class="place"><i class="fa fa-map-marker"></i> ${escapeHtml(ev.placeLabel)} — ${escapeHtml(ev.address)}</p>
              <a href="${escapeHtml(ev.map)}" target="_blank" rel="noopener">Xem bản đồ <i class="fa fa-caret-right"></i></a>
              <div><a class="cal-btn" href="${gcal}" target="_blank" rel="noopener">Thêm vào lịch</a></div>
            </div>
          </div>
        </article>`;
    });

    setText("quoteTitle", cfg.quote.title);
    setText("quoteText", '"' + (cfg.quote.text || "") + '"');
    setSrc("quoteImage", cfg.quote.image, "");
    setBg("quoteBand", cfg.quote.background);

    setText("galleryTitle", cfg.gallery.title);
    document.getElementById("btnMoreGallery").textContent = cfg.gallery.moreLabel;
    const gallery = cfg.gallery.images || [];
    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = "";
    const preview = 9;
    gallery.forEach((src, i) => {
      const item = document.createElement("div");
      item.className = "gallery-item" + (i >= preview ? " hidden extra" : "");
      item.innerHTML = `<img src="${escapeHtml(src)}" alt="Album ${i + 1}"><i class="fa fa-search"></i>`;
      item.addEventListener("click", () => openLb(i));
      grid.appendChild(item);
    });
    const moreBtn = document.getElementById("btnMoreGallery");
    moreBtn.style.display = gallery.length > preview ? "" : "none";
    moreBtn.onclick = () => {
      document.querySelectorAll(".gallery-item.extra").forEach((el) => el.classList.remove("hidden"));
      moreBtn.style.display = "none";
    };

    let lbIndex = 0;
    const lightbox = document.getElementById("lightbox");
    const lbImg = document.getElementById("lbImg");
    function openLb(i) {
      lbIndex = i;
      lbImg.src = gallery[lbIndex];
      lightbox.classList.add("open");
    }
    document.getElementById("lbClose").onclick = () => lightbox.classList.remove("open");
    document.getElementById("lbPrev").onclick = () =>
      openLb((lbIndex - 1 + gallery.length) % gallery.length);
    document.getElementById("lbNext").onclick = () => openLb((lbIndex + 1) % gallery.length);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });

    setText("wishesTitle", cfg.wishes.title);
    setText("wishesIntro", cfg.wishes.intro);
    const suggestBox = document.getElementById("suggestBox");
    suggestBox.innerHTML = (cfg.wishes.suggestions || [])
      .map((s) => `<button type="button">${escapeHtml(s)}</button>`)
      .join("");

    setHtml("giftTitle", '<i class="fa fa-gift"></i> ' + escapeHtml(cfg.gifts.title));
    const giftGrid = document.getElementById("giftGrid");
    giftGrid.innerHTML = "";
    (cfg.gifts.items || []).forEach((g) => {
      const qr =
        "https://img.vietqr.io/image/" +
        encodeURIComponent(g.bin || "") +
        "-" +
        encodeURIComponent(g.account || "") +
        "-compact2.png?accountName=" +
        encodeURIComponent(g.name || "");
      giftGrid.innerHTML += `
        <div class="gift-card">
          <span>${escapeHtml(g.side)}</span>
          <p><strong>${escapeHtml(g.name)}</strong></p>
          <p>${escapeHtml(g.bank)}</p>
          <p>${escapeHtml(g.account)}</p>
          <img class="qr" src="${qr}" alt="QR ${escapeHtml(g.name)}">
          <button class="copy-acc" data-acc="${escapeHtml(g.account)}" type="button">Sao chép STK</button>
        </div>`;
    });

    setText("footerThanks", cfg.footer.thanks);
    setText("footerNames", cfg.footer.names);
    setText("footerCopy", cfg.site.copyright);
    setBg("siteFooter", cfg.footer.background);

    const audio = document.getElementById("bgMusic");
    audio.src = cfg.site.musicUrl || "";

    bindChrome();
    bindWishes(cfg);
    bindGifts();
    bindMusic(audio);
  }

  function bindChrome() {
    window.addEventListener("load", () => {
      document.getElementById("preloader").classList.add("hide");
    });
    setTimeout(() => document.getElementById("preloader").classList.add("hide"), 2500);

    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    });
    const nav = document.getElementById("nav");
    document.getElementById("navToggle").addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

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
  }

  function bindWishes(cfg) {
    const KEY = "haithao-wishes";
    const seed = [
      {
        name: "Bạn thân",
        content: "Chúc mừng hạnh phúc " + cfg.couple.groom.name + " & " + cfg.couple.bride.name + ".",
      },
    ];
    function loadWishes() {
      try {
        return JSON.parse(localStorage.getItem(KEY)) || seed;
      } catch {
        return seed;
      }
    }
    function renderWishes() {
      document.getElementById("wishBox").innerHTML = loadWishes()
        .map(
          (w) =>
            `<div class="wish-item"><strong>${escapeHtml(w.name)}</strong><p>${escapeHtml(w.content)}</p></div>`
        )
        .join("");
    }
    renderWishes();
    const suggestBox = document.getElementById("suggestBox");
    document.getElementById("btnSuggest").addEventListener("click", () => suggestBox.classList.toggle("open"));
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
      localStorage.setItem(KEY, JSON.stringify(list));
      renderWishes();
      e.target.reset();
      document.getElementById("formMsg").textContent = "Cảm ơn bạn đã gửi lời chúc!";
    });
  }

  function bindGifts() {
    const giftGrid = document.getElementById("giftGrid");
    const giftModal = document.getElementById("giftModal");
    giftGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-acc");
      if (!btn) return;
      navigator.clipboard.writeText(btn.dataset.acc).then(() => {
        btn.textContent = "Đã sao chép";
        setTimeout(() => (btn.textContent = "Sao chép STK"), 1500);
      });
    });
    document.getElementById("btnGift").onclick = () => giftModal.classList.add("open");
    document.getElementById("giftClose").onclick = () => giftModal.classList.remove("open");
    giftModal.addEventListener("click", (e) => {
      if (e.target === giftModal) giftModal.classList.remove("open");
    });
  }

  function bindMusic(audio) {
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
  }
})();
