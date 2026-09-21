(function () {
  const WA_NUMBER = "6281219989168";
  const GRAM = 800;
  const grid = document.getElementById("grid");
  const filters = document.getElementById("filters");
  const q = document.getElementById("q");
  const modal = document.getElementById("modal");
  const countEl = document.getElementById("count");
  const cartPanel = document.getElementById("cartPanel");
  const destQ = document.getElementById("destQ");
  const destId = document.getElementById("destId");
  const destList = document.getElementById("destList");
  let cat = "all";
  let query = "";
  let currentId = null;
  let destTimer = null;
  let liveOngkir = null;
  let cart = JSON.parse(localStorage.getItem("atomyCart") || "{}");

  function waUrl(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }
  function saveCart() {
    localStorage.setItem("atomyCart", JSON.stringify(cart));
    renderCart();
    refreshOngkir();
  }
  function cartQty() {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }
  function rupiah(n) {
    return "Rp " + Math.round(n).toLocaleString("id-ID");
  }
  function weightGram() {
    return Math.max(1000, cartQty() * GRAM);
  }
  function fallbackOngkir() {
    const text = (destQ.value || "").toLowerCase();
    const city = (window.CITIES || []).find((c) => text.indexOf(c.n.toLowerCase()) !== -1);
    if (!city) return null;
    const zone = window.ONGKIR[city.z];
    const kg = Math.max(1, Math.ceil(weightGram() / 1000));
    return { cost: zone.kg * kg, kg: kg, etd: zone.etd, service: "Estimasi", name: zone.label };
  }
  function currentOngkir() {
    return liveOngkir || fallbackOngkir();
  }

  const defaultWa = "Halo, saya lihat katalog Atomy di katalogatomy.online. Saya ingin bertanya tentang produk.";
  document.querySelectorAll("[data-wa]").forEach((el) => {
    el.href = waUrl(defaultWa);
  });

  window.CATS.forEach((c) => {
    const b = document.createElement("button");
    b.className = "chip" + (c.id === "all" ? " active" : "");
    b.textContent = c.label;
    b.onclick = () => {
      cat = c.id;
      document.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      render();
    };
    filters.appendChild(b);
  });

  q.addEventListener("input", () => {
    query = q.value.trim().toLowerCase();
    render();
  });

  function filtered() {
    return window.PRODUCTS.filter((p) => {
      const okCat = cat === "all" || p.cat === cat;
      const blob = (p.name + " " + p.tag + " " + p.manfaat).toLowerCase();
      return okCat && (!query || blob.includes(query));
    });
  }

  function addItem(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
  }

  function render() {
    const list = filtered();
    countEl.textContent = list.length;
    if (!list.length) {
      grid.innerHTML = '<p class="empty">Tidak ada produk yang cocok.</p>';
      return;
    }
    grid.innerHTML = list.map((p) => `
      <article class="card" data-id="${p.id}">
        <div class="thumb"><img src="${p.img}" alt="Atomy ${p.name} — ${p.tag}" loading="lazy"></div>
        <div class="body">
          <div class="tag">${p.tag}</div>
          <h3>${p.name}</h3>
          <p class="excerpt">${p.manfaat}</p>
          <div class="card-actions">
            <span class="more">Detail →</span>
            <button type="button" class="add-mini" data-add="${p.id}">Pesan</button>
          </div>
        </div>
      </article>`).join("");
    grid.querySelectorAll(".card").forEach((el) => {
      el.onclick = () => open(+el.dataset.id);
    });
    grid.querySelectorAll("[data-add]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        addItem(+btn.dataset.add);
        cartPanel.hidden = false;
      };
    });
  }

  function open(id) {
    const p = window.PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    currentId = id;
    document.getElementById("mimg").src = p.img;
    document.getElementById("mimg").alt = p.name;
    document.getElementById("mtag").textContent = p.tag;
    document.getElementById("mname").textContent = p.name;
    document.getElementById("mmanfaat").textContent = p.manfaat;
    document.getElementById("mdosis").textContent = p.dosis;
    const msg = "Halo, saya tertarik dengan produk Atomy " + p.name + " dari katalogatomy.online. Boleh info stok, harga, dan cara pemesanan?";
    document.getElementById("mwa").href = waUrl(msg);
    modal.classList.add("open");
  }

  function renderCart() {
    document.getElementById("cartCount").textContent = cartQty();
    const box = document.getElementById("cartItems");
    const ids = Object.keys(cart);
    if (!ids.length) {
      box.innerHTML = '<p class="empty">Keranjang masih kosong. Pilih produk lalu klik Pesan.</p>';
    } else {
      box.innerHTML = ids.map((id) => {
        const p = window.PRODUCTS.find((x) => x.id === +id);
        if (!p) return "";
        return `<div class="cart-row">
          <img src="${p.img}" alt="">
          <div>
            <b>${p.name}</b>
            <div class="qty">
              <button type="button" data-dec="${id}">−</button>
              <span>${cart[id]}</span>
              <button type="button" data-inc="${id}">+</button>
            </div>
          </div>
        </div>`;
      }).join("");
      box.querySelectorAll("[data-inc]").forEach((b) => {
        b.onclick = () => { cart[b.dataset.inc]++; saveCart(); };
      });
      box.querySelectorAll("[data-dec]").forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.dec;
          cart[id]--;
          if (cart[id] <= 0) delete cart[id];
          saveCart();
        };
      });
    }
    paintOngkir();
  }

  function paintOngkir() {
    const ongkirBox = document.getElementById("ongkirBox");
    const info = currentOngkir();
    if (!cartQty()) {
      ongkirBox.textContent = "Tambah produk untuk menghitung ongkir.";
      return;
    }
    if (!destQ.value) {
      ongkirBox.textContent = "Ketik kelurahan tujuan, contoh: Wonokromo Surabaya.";
      return;
    }
    if (!info) {
      ongkirBox.textContent = "Pilih salah satu hasil pencarian alamat di bawah kotak.";
      return;
    }
    const src = liveOngkir ? "RajaOngkir" : "estimasi";
    ongkirBox.innerHTML = "<strong>" + rupiah(info.cost) + "</strong> · " + (info.name || "") +
      " " + (info.service || "") + " · ±" + info.kg + " kg · " + info.etd +
      "<br><small>" + src + " dari " + window.RO.originLabel + ". Harga produk dikonfirmasi penjual.</small>";
  }

  async function refreshOngkir() {
    liveOngkir = null;
    paintOngkir();
    if (!cartQty() || !destId.value) return;
    const courier = document.getElementById("kurir").value;
    const kg = Math.max(1, Math.ceil(weightGram() / 1000));
    try {
      const list = await window.RO.cost(destId.value, weightGram(), courier);
      const pick = window.RO.pick(list);
      if (pick) {
        liveOngkir = {
          cost: pick.cost,
          kg: kg,
          etd: pick.etd || "-",
          service: pick.service,
          name: pick.name
        };
      }
    } catch (err) {
      liveOngkir = null;
    }
    paintOngkir();
  }

  destQ.addEventListener("input", () => {
    destId.value = "";
    liveOngkir = null;
    clearTimeout(destTimer);
    const term = destQ.value.trim();
    if (term.length < 3) {
      destList.innerHTML = "";
      paintOngkir();
      return;
    }
    destTimer = setTimeout(async () => {
      try {
        const rows = await window.RO.search(term);
        destList.innerHTML = rows.map((row) =>
          '<button type="button" class="dest-item" data-id="' + row.id + '">' + row.label + "</button>"
        ).join("") || '<p class="empty">Tidak ketemu. Coba nama kelurahan.</p>';
        destList.querySelectorAll(".dest-item").forEach((btn) => {
          btn.onclick = () => {
            destId.value = btn.dataset.id;
            destQ.value = btn.textContent;
            destList.innerHTML = "";
            refreshOngkir();
          };
        });
      } catch (err) {
        destList.innerHTML = "";
        paintOngkir();
      }
    }, 350);
  });

  document.getElementById("openCart").onclick = () => { cartPanel.hidden = false; };
  document.getElementById("closeCart").onclick = () => { cartPanel.hidden = true; };
  cartPanel.addEventListener("click", (e) => {
    if (e.target === cartPanel) cartPanel.hidden = true;
  });
  document.getElementById("kurir").addEventListener("change", refreshOngkir);

  document.getElementById("madd").onclick = () => {
    if (currentId == null) return;
    addItem(currentId);
    modal.classList.remove("open");
    cartPanel.hidden = false;
  };

  document.getElementById("orderForm").onsubmit = (e) => {
    e.preventDefault();
    if (!cartQty()) return;
    const fd = new FormData(e.target);
    const info = currentOngkir();
    const lines = Object.keys(cart).map((id) => {
      const p = window.PRODUCTS.find((x) => x.id === +id);
      return "- " + p.name + " x " + cart[id];
    });
    const kurir = document.getElementById("kurir").selectedOptions[0].text;
    const msg = [
      "Halo, saya ingin pesan dari katalogatomy.online:",
      "",
      lines.join("\n"),
      "",
      "Nama: " + fd.get("nama"),
      "HP: " + fd.get("hp"),
      "Tujuan: " + fd.get("kota"),
      "Alamat: " + fd.get("alamat"),
      "Kurir: " + kurir + (info && info.service ? " " + info.service : ""),
      info ? ("Ongkir: " + rupiah(info.cost) + " (" + info.kg + " kg, " + info.etd + ")") : "",
      "",
      "Mohon konfirmasi stok, total harga, dan cara bayar."
    ].filter(Boolean).join("\n");
    window.open(waUrl(msg), "_blank", "noopener");
  };

  document.getElementById("close").onclick = () => modal.classList.remove("open");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal.classList.remove("open");
      cartPanel.hidden = true;
    }
  });

  render();
  renderCart();
})();
