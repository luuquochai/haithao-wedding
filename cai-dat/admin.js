(function () {
  const titles = {
    chung: "Chung",
    hero: "Banner / Hero",
    couple: "Cặp đôi",
    countdown: "Countdown",
    events: "Sự kiện cưới",
    quote: "Love Quote",
    gallery: "Album ảnh",
    wishes: "Sổ lưu bút",
    gifts: "Hộp mừng cưới",
    footer: "Footer",
    security: "Bảo mật",
  };

  let cfg = null;

  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  }

  function setPath(obj, path, value) {
    const keys = path.split(".");
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof cur[keys[i]] !== "object" || cur[keys[i]] == null) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }

  function toDatetimeLocal(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 16);
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => {
      el.hidden = true;
    }, 3200);
  }

  function imageField(name, value, label) {
    const wrap = document.createElement("div");
    wrap.className = "image-field";
    wrap.innerHTML =
      "<label>" +
      (label || "Ảnh") +
      '<input type="url" data-img="' +
      name +
      '" value="">' +
      "</label>" +
      '<img class="thumb" alt="">' +
      '<div class="file-row"><input type="file" accept="image/*"><span>hoặc chọn file từ máy</span></div>';
    const input = wrap.querySelector("input[data-img]");
    const img = wrap.querySelector(".thumb");
    const file = wrap.querySelector('input[type="file"]');
    function preview(src) {
      input.value = src && src.indexOf("data:") === 0 ? "" : src || "";
      input.dataset.dataurl = src && src.indexOf("data:") === 0 ? src : "";
      img.src = src || "";
      img.style.display = src ? "block" : "none";
    }
    preview(value || "");
    input.addEventListener("input", () => preview(input.value));
    file.addEventListener("change", async () => {
      if (!file.files[0]) return;
      const data = await WeddingStore.fileToDataUrl(file.files[0], 1600);
      preview(data);
    });
    return wrap;
  }

  function currentImage(fieldRoot) {
    const input = fieldRoot.querySelector("input[data-img]");
    return input.dataset.dataurl || input.value.trim();
  }

  function fillSimpleFields() {
    document.querySelectorAll("#editor [name]").forEach((el) => {
      const val = getPath(cfg, el.name);
      if (el.type === "datetime-local") el.value = toDatetimeLocal(val);
      else el.value = val == null ? "" : val;
    });
    document.querySelectorAll("#editor .image-field[data-name]").forEach((el) => {
      const next = imageField(el.dataset.name, getPath(cfg, el.dataset.name), el.dataset.label || "Ảnh");
      next.dataset.name = el.dataset.name;
      if (el.dataset.label) next.dataset.label = el.dataset.label;
      el.replaceWith(next);
    });
  }

  function renderSlides() {
    const box = document.getElementById("slidesList");
    box.innerHTML = "";
    (cfg.hero.slides || []).forEach((src, i) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = '<div class="list-head"><strong>Slide ' + (i + 1) + '</strong><button type="button" class="btn danger">Xóa</button></div>';
      item.appendChild(imageField("slide-" + i, src, "URL ảnh"));
      item.querySelector(".danger").onclick = () => {
        cfg.hero.slides.splice(i, 1);
        renderSlides();
      };
      box.appendChild(item);
    });
  }

  function renderEvents() {
    const box = document.getElementById("eventsList");
    box.innerHTML = "";
    (cfg.events.items || []).forEach((ev, i) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML =
        '<div class="list-head"><strong>Sự kiện ' +
        (i + 1) +
        '</strong><button type="button" class="btn danger">Xóa</button></div>' +
        '<label>Tên sự kiện <input data-k="title"></label>' +
        '<div class="row-2"><label>Ngày <input type="date" data-k="date"></label><label>Giờ <input type="time" data-k="time"></label></div>' +
        '<label>Nhãn địa điểm <input data-k="placeLabel"></label>' +
        '<label>Địa chỉ <input data-k="address"></label>' +
        '<label>Link Google Maps <input data-k="map"></label>';
      ["title", "date", "time", "placeLabel", "address", "map"].forEach((k) => {
        item.querySelector("[data-k='" + k + "']").value = ev[k] || "";
      });
      item.appendChild(imageField("event-img-" + i, ev.image, "Ảnh sự kiện"));
      item.querySelector(".danger").onclick = () => {
        cfg.events.items.splice(i, 1);
        collectListsIntoCfg();
        renderEvents();
      };
      box.appendChild(item);
    });
  }

  function renderGallery() {
    const box = document.getElementById("galleryList");
    box.innerHTML = "";
    (cfg.gallery.images || []).forEach((src, i) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = '<div class="list-head"><strong>Ảnh ' + (i + 1) + '</strong><button type="button" class="btn danger">Xóa</button></div>';
      item.appendChild(imageField("gal-" + i, src, "URL ảnh"));
      item.querySelector(".danger").onclick = () => {
        collectListsIntoCfg();
        cfg.gallery.images.splice(i, 1);
        renderGallery();
      };
      box.appendChild(item);
    });
  }

  function renderSuggestions() {
    const box = document.getElementById("suggestionsList");
    box.innerHTML = "";
    (cfg.wishes.suggestions || []).forEach((text, i) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML =
        '<div class="list-head"><strong>Gợi ý ' +
        (i + 1) +
        '</strong><button type="button" class="btn danger">Xóa</button></div>' +
        "<textarea rows='2'></textarea>";
      item.querySelector("textarea").value = text;
      item.querySelector(".danger").onclick = () => {
        collectListsIntoCfg();
        cfg.wishes.suggestions.splice(i, 1);
        renderSuggestions();
      };
      box.appendChild(item);
    });
  }

  function renderGifts() {
    const box = document.getElementById("giftsList");
    box.innerHTML = "";
    (cfg.gifts.items || []).forEach((g, i) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML =
        '<div class="list-head"><strong>Tài khoản ' +
        (i + 1) +
        '</strong><button type="button" class="btn danger">Xóa</button></div>' +
        '<label>Bên <input data-k="side"></label>' +
        '<label>Tên chủ TK <input data-k="name"></label>' +
        '<label>Ngân hàng <input data-k="bank"></label>' +
        '<label>Mã BIN (VietQR) <input data-k="bin"></label>' +
        '<label>Số tài khoản <input data-k="account"></label>';
      ["side", "name", "bank", "bin", "account"].forEach((k) => {
        item.querySelector("[data-k='" + k + "']").value = g[k] || "";
      });
      item.querySelector(".danger").onclick = () => {
        collectListsIntoCfg();
        cfg.gifts.items.splice(i, 1);
        renderGifts();
      };
      box.appendChild(item);
    });
  }

  function collectSimpleFields() {
    document.querySelectorAll("#editor [name]").forEach((el) => {
      let val = el.value;
      if (el.type === "datetime-local" && val) val = val + ":00+07:00";
      setPath(cfg, el.name, val);
    });
    document.querySelectorAll("#editor > .panel .image-field[data-name], #panel-couple .image-field[data-name]").forEach((el) => {
      setPath(cfg, el.dataset.name, currentImage(el));
    });
  }

  function collectListsIntoCfg() {
    cfg.hero.slides = [...document.querySelectorAll("#slidesList .list-item")].map((item) =>
      currentImage(item.querySelector(".image-field"))
    );
    cfg.events.items = [...document.querySelectorAll("#eventsList .list-item")].map((item) => {
      const row = {};
      item.querySelectorAll("[data-k]").forEach((inp) => {
        row[inp.dataset.k] = inp.value;
      });
      row.image = currentImage(item.querySelector(".image-field"));
      return row;
    });
    cfg.gallery.images = [...document.querySelectorAll("#galleryList .list-item")].map((item) =>
      currentImage(item.querySelector(".image-field"))
    );
    cfg.wishes.suggestions = [...document.querySelectorAll("#suggestionsList textarea")].map((t) => t.value);
    cfg.gifts.items = [...document.querySelectorAll("#giftsList .list-item")].map((item) => {
      const row = {};
      item.querySelectorAll("[data-k]").forEach((inp) => {
        row[inp.dataset.k] = inp.value;
      });
      return row;
    });
  }

  function renderAll() {
    fillSimpleFields();
    renderSlides();
    renderEvents();
    renderGallery();
    renderSuggestions();
    renderGifts();
  }

  function collectAll() {
    collectSimpleFields();
    collectListsIntoCfg();
    // couple photos live inside fieldsets, not only top-level image-fields
    document.querySelectorAll("#panel-couple .image-field").forEach((el) => {
      if (el.dataset.name) setPath(cfg, el.dataset.name, currentImage(el));
    });
  }

  function download(filename, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function boot() {
    cfg = await WeddingStore.load();
    if (!WeddingStore.isAuthed()) {
      document.getElementById("login").hidden = false;
      document.getElementById("app").hidden = true;
    } else {
      document.getElementById("login").hidden = true;
      document.getElementById("app").hidden = false;
      renderAll();
    }
  }

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    cfg = cfg || (await WeddingStore.load());
    const pin = document.getElementById("pin").value.trim();
    if (pin !== String(cfg.adminPin || "1234")) {
      document.getElementById("loginError").textContent = "Sai mã PIN.";
      return;
    }
    WeddingStore.setAuthed(true);
    document.getElementById("login").hidden = true;
    document.getElementById("app").hidden = false;
    renderAll();
  });

  document.getElementById("sideNav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-panel]");
    if (!btn) return;
    document.querySelectorAll("#sideNav button").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".panel").forEach((p) => {
      p.hidden = p.id !== "panel-" + btn.dataset.panel;
    });
    document.getElementById("panelTitle").textContent = titles[btn.dataset.panel];
  });

  document.getElementById("editor").addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (!add) return;
    collectListsIntoCfg();
    if (add.dataset.add === "slides") cfg.hero.slides.push("");
    if (add.dataset.add === "events") {
      cfg.events.items.push({
        title: "Sự kiện mới",
        date: "",
        time: "",
        placeLabel: "",
        address: "",
        map: "",
        image: "",
      });
    }
    if (add.dataset.add === "gallery") cfg.gallery.images.push("");
    if (add.dataset.add === "suggestions") cfg.wishes.suggestions.push("");
    if (add.dataset.add === "gifts") {
      cfg.gifts.items.push({ side: "", name: "", bank: "", bin: "", account: "" });
    }
    renderSlides();
    renderEvents();
    renderGallery();
    renderSuggestions();
    renderGifts();
  });

  document.getElementById("btnSave").addEventListener("click", async () => {
    collectAll();
    await WeddingStore.save(cfg);
    showToast("Đã lưu. Mở trang chủ để xem nội dung mới.");
  });

  document.getElementById("btnExport").addEventListener("click", () => {
    collectAll();
    download("config.js", WeddingStore.toConfigJs(cfg));
    showToast("Đã tải file config.js. Hãy thay file js/config.js rồi deploy lại.");
  });

  document.getElementById("btnReset").addEventListener("click", async () => {
    if (!confirm("Xóa nội dung đã lưu và trở về mặc định?")) return;
    await WeddingStore.reset();
    cfg = await WeddingStore.load();
    renderAll();
    showToast("Đã đặt lại nội dung mặc định.");
  });

  boot();
})();
