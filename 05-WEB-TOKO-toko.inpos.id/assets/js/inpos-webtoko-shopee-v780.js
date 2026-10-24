/*!
 * INPOS Web Toko — Additive Category Bar & Header Sync (v780)
 * Hanya membaca DOM (#category) dan men-trigger event 'change' miliknya.
 * Tidak membuat state keranjang, fetch baru, atau mengubah logika bawaan.
 */
(function () {
  "use strict";

  var EMOJI_RULES = [
    { re: /\b(semua|all)\b/i, icon: "🏠" },
    { re: /\b(makan|food|nasi|mie|ayam|bakso|soto|lauk|kuliner)\b/i, icon: "🍜" },
    { re: /\b(minum|drink|kopi|teh|jus|es|susu|sirup|air)\b/i, icon: "🥤" },
    { re: /\b(snack|cemilan|camilan|keripik|kue|roti|biskuit|coklat)\b/i, icon: "🍪" },
    { re: /\b(sembako|beras|minyak|gula|tepung|telur|mie instan)\b/i, icon: "🌾" },
    { re: /\b(bumbu|dapur|masak|saus|kecap|garam|rempah)\b/i, icon: "🧂" },
    { re: /\b(sayur|buah|segar|fresh|cabe|bawang)\b/i, icon: "🥬" },
    { re: /\b(daging|ikan|seafood|frozen|beku|sosis|nugget)\b/i, icon: "🍗" },
    { re: /\b(obat|kesehatan|vitamin|herbal|medis|apotek)\b/i, icon: "💊" },
    { re: /\b(sabun|shampoo|deterjen|cuci|kebersihan|tisu|toilet)\b/i, icon: "🧼" },
    { re: /\b(kosmetik|skincare|cantik|parfum|body|wajah)\b/i, icon: "💄" },
    { re: /\b(baju|pakaian|kaos|celana|fashion|hijab|sepatu|tas)\b/i, icon: "👕" },
    { re: /\b(elektronik|kabel|charger|lampu|baterai|aksesoris|hp|pulsa)\b/i, icon: "🔌" },
    { re: /\b(atk|tulis|buku|kantor|sekolah|kertas|pena)\b/i, icon: "✏️" },
    { re: /\b(bayi|anak|popok|mainan)\b/i, icon: "🍼" },
    { re: /\b(rumah|perabot|alat|perkakas|plastik|kemasan)\b/i, icon: "🧺" },
    { re: /\b(paket|hemat|bundling|promo)\b/i, icon: "📦" }
  ];

  function extractCategoryTileMeta(label) {
    var clean = String(label || "").trim();
    if (!clean) {
      return { kind: "initial", text: "KT" };
    }

    // Jika label sudah memiliki karakter emoji di dalamnya, gunakan langsung
    var emojiMatch = clean.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    if (emojiMatch) {
      return { kind: "emoji", text: emojiMatch[0] };
    }

    // Cocokkan dengan kata kunci kategori umum
    for (var i = 0; i < EMOJI_RULES.length; i++) {
      if (EMOJI_RULES[i].re.test(clean)) {
        return { kind: "emoji", text: EMOJI_RULES[i].icon };
      }
    }

    // Fallback: ambil inisial 2 huruf dari nama kategori
    var words = clean.replace(/[^a-zA-Z0-9\s]/g, " ").trim().split(/\s+/);
    var initials = "";
    if (words.length >= 2) {
      initials = (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    } else {
      initials = clean.slice(0, 2).toUpperCase();
    }
    return { kind: "initial", text: initials || "KT" };
  }

  function initCategoryBar() {
    var selectEl = document.getElementById("category");
    var catalogEl = document.querySelector(".catalog");
    var controlEl = document.querySelector(".control");
    if (!selectEl || !catalogEl || !controlEl) return;

    var sectionEl = document.createElement("nav");
    sectionEl.className = "wt780-catbar-section";
    sectionEl.setAttribute("aria-label", "Kategori");
    sectionEl.hidden = true;

    var headEl = document.createElement("div");
    headEl.className = "wt780-catbar-head";
    headEl.textContent = "Kategori";

    var trackEl = document.createElement("div");
    trackEl.className = "wt780-catbar-track";

    sectionEl.appendChild(headEl);
    sectionEl.appendChild(trackEl);

    // Sisipkan tepat di atas .control di dalam .catalog (tanpa memindahkan node asli)
    controlEl.parentNode.insertBefore(sectionEl, controlEl);

    var lastSignature = "";

    function syncActiveState() {
      var currentVal = selectEl.value;
      var buttons = trackEl.querySelectorAll(".wt780-cat-btn");
      for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        var isActive = btn.getAttribute("data-value") === currentVal;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      }
    }

    function rebuildCategoryTiles() {
      var options = selectEl.options;
      var sigParts = [];
      for (var i = 0; i < options.length; i++) {
        sigParts.push(options[i].value + "::" + options[i].text);
      }
      var signature = sigParts.join("|");
      if (signature === lastSignature) {
        syncActiveState();
        return;
      }
      lastSignature = signature;

      // Hanya "Semua kategori" (atau kosong) berarti toko belum punya kategori nyata —
      // satu ubin sendirian lebih buruk daripada tidak ada baris kategori sama sekali.
      sectionEl.hidden = options.length < 3;

      trackEl.textContent = "";

      for (var j = 0; j < options.length; j++) {
        var opt = options[j];
        var rawLabel = (opt.textContent || opt.innerText || "").trim();
        if (!rawLabel) continue;

        var meta = extractCategoryTileMeta(rawLabel);

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "wt780-cat-btn";
        btn.setAttribute("data-value", opt.value);

        var tile = document.createElement("span");
        tile.className = "wt780-cat-tile";
        tile.setAttribute("data-kind", meta.kind);
        tile.setAttribute("aria-hidden", "true");
        tile.textContent = meta.text;

        var label = document.createElement("span");
        label.className = "wt780-cat-label";
        label.textContent = rawLabel;

        btn.appendChild(tile);
        btn.appendChild(label);

        btn.addEventListener("click", (function (targetValue) {
          return function () {
            if (selectEl.value !== targetValue) {
              selectEl.value = targetValue;
              selectEl.dispatchEvent(new Event("change", { bubbles: true }));
            }
            syncActiveState();
          };
        })(opt.value));

        trackEl.appendChild(btn);
      }

      syncActiveState();
    }

    rebuildCategoryTiles();

    // Update status aktif bila dropdown #category diubah langsung (mis. di desktop)
    selectEl.addEventListener("change", syncActiveState);

    // Pantau saat fetch katalog selesai dan <option> ditambahkan ke #category
    var observer = new MutationObserver(function () {
      rebuildCategoryTiles();
    });
    observer.observe(selectEl, { childList: true, subtree: true, characterData: true });
  }

  function syncHeaderOffset() {
    var headerEl = document.querySelector("header, .site-header, body > .nav");
    if (!headerEl) return;

    // Header-nya position:sticky top:0, jadi offset-nya tidak berubah saat scroll.
    // Mengukur ulang tiap event scroll memaksa reflow per frame — cukup saat muat & resize.
    function updateOffset() {
      var topPx = Math.max(0, Math.round(headerEl.getBoundingClientRect().top + window.scrollY));
      document.documentElement.style.setProperty("--wt780-header-top", topPx + "px");
    }

    updateOffset();
    window.addEventListener("resize", updateOffset, { passive: true });
    if (window.ResizeObserver) {
      new ResizeObserver(updateOffset).observe(headerEl);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initCategoryBar();
      syncHeaderOffset();
    });
  } else {
    initCategoryBar();
    syncHeaderOffset();
  }
})();
