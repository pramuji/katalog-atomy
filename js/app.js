(function () {
  const WA_NUMBER = "6281282594453";
  const grid = document.getElementById("grid");
  const filters = document.getElementById("filters");
  const q = document.getElementById("q");
  const modal = document.getElementById("modal");
  const countEl = document.getElementById("count");
  let cat = "all";
  let query = "";

  function waUrl(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
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
          <div class="more">Lihat dosis & cara pakai →</div>
        </div>
      </article>`).join("");
    grid.querySelectorAll(".card").forEach((el) => {
      el.onclick = () => open(+el.dataset.id);
    });
  }

  function open(id) {
    const p = window.PRODUCTS.find((x) => x.id === id);
    if (!p) return;
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

  document.getElementById("close").onclick = () => modal.classList.remove("open");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.remove("open");
  });

  render();
})();
