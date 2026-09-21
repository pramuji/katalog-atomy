window.RO = {
  origin: 17547,
  originLabel: "Jakarta Selatan (Kebayoran Lama)",
  key: "0RTlP0Nhf0ddcf6c89834201AMvLeGG0",
  async search(q) {
    const url = "https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=" +
      encodeURIComponent(q) + "&limit=8&offset=0";
    const r = await fetch(url, { headers: { key: this.key } });
    const j = await r.json();
    if (j.meta && j.meta.status !== "success") throw new Error(j.meta.message || "Gagal cari kota");
    return j.data || [];
  },
  async cost(destId, weight, courier) {
    const body = new URLSearchParams({
      origin: String(this.origin),
      destination: String(destId),
      weight: String(Math.max(1000, weight)),
      courier: courier,
      price: "lowest"
    });
    const r = await fetch("https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost", {
      method: "POST",
      headers: { key: this.key, "Content-Type": "application/x-www-form-urlencoded" },
      body: body
    });
    const j = await r.json();
    if (j.meta && j.meta.status !== "success") throw new Error(j.meta.message || "Gagal cek ongkir");
    return j.data || [];
  },
  pick(list) {
    const prefer = ["REG", "CTC", "EZ", "GOKIL", "SIUNT", "HALU", "YES"];
    const affordable = (list || []).filter((x) => x.cost && x.cost < 250000);
    for (let i = 0; i < prefer.length; i++) {
      const hit = affordable.find((x) => (x.service || "").toUpperCase().indexOf(prefer[i]) !== -1);
      if (hit) return hit;
    }
    return affordable.sort((a, b) => a.cost - b.cost)[0] || list[0] || null;
  }
};
