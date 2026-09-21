(function () {
  const WA_NUMBER = "6281219989168";
  const GRAM = 800;
  const grid = document.getElementById("grid");
  const filters = document.getElementById("filters");
  const q = document.getElementById("q");
  const modal = document.getElementById("modal");
  const countEl = document.getElementById("count");
  const cartPanel = document.getElementById("cartPanel");
  const kotaSel = document.getElementById("kota");
  let cat = "all";
  let query = "";
  let currentId = null;
  let cart = JSON.parse(localStorage.getItem("atomyCart") || "{}");

  function waUrl(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }
  function saveCart() {
    localStorage.setItem("atomyCart", JSON.stringify(cart));
    renderCart();
  }
  function cartQty() {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }
  function rupiah(n) {
    return "Rp " + Math.round(n).toLocaleString("id-ID");
  }
  function cityByName(name) {
    return (window.CITIES || []).find((c) => c.n === name);
  }
  function ongkirInfo() {
    const city = cityByName(kotaSel.value);
    if (!city) return null;
    const zone = window.ONGKIR[city.z];
    const kg = Math.max(1, Math.ceil((cartQty() * GRAM) / 1000));
    return { city, zone, kg, cost: zone.kg * kg };
  }

  const defaultWa = "Halo, saya lihat katalog Atomy di katalogatomy.online. Saya ingin bertanya tentang produk.";
  document.querySelectorAll("[data-wa]").forEach((el) => {
    el.href = waUrl(defaultWa);
  });

  (window.CITIES || []).forEach((c) => {
    const o = document.createElement("option");
    o.value = c.n;
    o.textContent = c.n;
    kotaSel.appendChild(o);
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
    const info = ongkirInfo();
    const ongkirBox = document.getElementById("ongkirBox");
    if (!cartQty()) {
      ongkirBox.textContent = "Tambah produk untuk menghitung ongkir.";
    } else if (!info) {
      ongkirBox.textContent = "Pilih kota tujuan untuk estimasi ongkir.";
    } else {
      ongkirBox.innerHTML = "<strong>" + rupiah(info.cost) + "</strong> · " + info.zone.label +
        " · ±" + info.kg + " kg · " + info.zone.etd +
        "<br><small>Estimasi kurir REG dari Jakarta Selatan. Total harga produk dikonfirmasi penjual.</small>";
    }
  }

  document.getElementById("openCart").onclick = () => { cartPanel.hidden = false; };
  document.getElementById("closeCart").onclick = () => { cartPanel.hidden = true; };
  cartPanel.addEventListener("click", (e) => {
    if (e.target === cartPanel) cartPanel.hidden = true;
  });
  kotaSel.addEventListener("change", renderCart);
  document.getElementById("kurir").addEventListener("change", renderCart);

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
    const info = ongkirInfo();
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
      "Kota: " + fd.get("kota"),
      "Alamat: " + fd.get("alamat"),
      "Kurir: " + kurir,
      info ? ("Estimasi ongkir: " + rupiah(info.cost) + " (" + info.kg + " kg, " + info.zone.etd + ")") : "",
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
