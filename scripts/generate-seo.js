const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataSrc = fs.readFileSync(path.join(root, "js/data.js"), "utf8");
const box = { window: {} };
new Function("window", dataSrc)(box.window);
const products = box.window.PRODUCTS;
const SITE = "https://katalogatomy.online";
const WA = "6281219989168";
const today = new Date().toISOString().slice(0, 10);

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/\+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function clip(s, n) {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}

const CAT_NOTE = {
  vitamin: "Kelompok vitamin dan mineral. Dipakai sebagai pelengkap makanan harian, bukan pengganti menu seimbang atau obat.",
  imun: "Kelompok dukungan daya tahan. Hasil tiap orang berbeda; tetap utamakan tidur, makanan, dan petunjuk kemasan.",
  ginseng: "Kelompok ginseng Atomy. Umumnya diminum pagi. Hentikan dan tanya dokter jika ada larangan stimulan atau pengencer darah.",
  omega: "Kelompok omega-3. Lebih nyaman diminum setelah makan.",
  metabolik: "Kelompok dukungan metabolisme. Bukan obat diet, gula darah, kolesterol, atau pencernaan.",
  tulang: "Kelompok dukungan tulang, sendi, atau mata, sesuai label masing-masing produk.",
  khusus: "Kelompok kebutuhan khusus pria atau wanita. Baca peringatan usia dan kondisi pada kemasan.",
  cantik: "Kelompok beauty drink. Perubahan kulit butuh waktu dan tidak menggantikan tabir surya.",
  anak: "Kelompok produk anak. Ikuti batas usia pada kemasan dan simpan di luar jangkauan anak kecil.",
  skincare: "Kelompok perawatan kulit. Uji dulu di kulit tipis jika mudah iritasi, dan hindari mata.",
  makeup: "Kelompok makeup. Cocokkan warna di cahaya matahari, bukan hanya di bawah lampu ruangan.",
  rambut: "Kelompok rambut dan kulit kepala. Jangan dipakai pada luka terbuka.",
  lain: "Ikuti urutan dan lama pemakaian yang tertulis di kemasan."
};

const EXTRA = {
  HemoHIM: "Pencarian yang paling sering: cara minum HemoHIM, dosis dewasa, dan aturan untuk anak. Di kemasan yang dirangkum katalog ini, dewasa 1 sachet dua kali sehari, anak 6 tahun ke atas 1 sachet sehari, dan tidak untuk anak di bawah 6 tahun. Ibu hamil, menyusui, atau dengan gangguan perdarahan perlu bertanya ke dokter dulu. HemoHIM adalah suplemen, bukan obat.",
  "Vital Color Vitamin C": "Vitamin C Colorfood dicari sebagai vitamin C harian rasa buah-sayur. Minum 1 sachet sehari, dilarutkan, lalu diminum segera. Bukan pengganti buah dan sayur utuh.",
  "Organic Fermented Noni": "Noni fermentasi Atomy dicari untuk imunitas dan pencernaan. Takaran yang biasa ditulis: 30 ml, 1–2 kali sehari, kocok dulu, boleh diencerkan, dan simpan di kulkas setelah dibuka.",
  "rTG Omega-3": "Omega-3 bentuk rTG dicari untuk jantung, otak, dan mata. Kapsul diminum setelah makan. Ini minyak ikan, bukan obat kolesterol.",
  "Probiotics 10+": "Probiotik 10+ dicari untuk pencernaan. Satu sachet sehari dengan air suhu ruang, bukan air panas, agar bakteri tidak rusak.",
  "Red Ginseng Granule": "Hongsamdan ginseng merah dicari untuk stamina. Dewasa biasanya 1 sachet sehari; di bawah 18 tahun setengah sachet, sesuai kemasan.",
  "Absolute CellActive Ampoule": "Ampul Absolute CellActive adalah langkah kental pada rangkaian anti-aging: tetes di telapak, ratakan ke wajah dan leher, tepuk hingga meresap, hindari mata.",
  "Inner Collagen": "Kolagen minum Atomy dicari untuk elastisitas kulit. Satu botol 25 ml sehari, lebih nyaman di antara waktu makan dan dalam keadaan dingin.",
  "Mega Vitamin D3K2": "Vitamin D3 4.000 IU plus K2 diminum 1 kapsul sehari bersama makanan berlemak, supaya penyerapan kalsium lebih terbantu."
};

const used = new Set();
const items = products.map((p) => {
  let slug = slugify(p.name);
  if (used.has(slug)) slug = slug + "-" + p.id;
  used.add(slug);
  return Object.assign({}, p, { slug: slug, url: SITE + "/produk/" + slug + "/" });
});

function page(p) {
  const title = "Atomy " + p.name + ": Manfaat, Cara Pakai & Dosis";
  const desc = clip(p.manfaat + " Cara pakai: " + p.dosis, 155);
  const related = items.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  const relatedHtml = related
    .map((r) => '<li><a href="/produk/' + r.slug + '/">Atomy ' + esc(r.name) + "</a> — " + esc(r.tag) + "</li>")
    .join("\n");
  const note = CAT_NOTE[p.cat] || CAT_NOTE.lain;
  const extra = EXTRA[p.name] ? "<h2>Yang sering ditanyakan</h2><p>" + esc(EXTRA[p.name]) + "</p>" : "";
  const webp = p.img.replace(/\.jpg$/, ".webp");
  const faqLd = [
    { "@type": "Question", name: "Cara pakai " + p.name + " Atomy?", acceptedAnswer: { "@type": "Answer", text: p.dosis } },
    { "@type": "Question", name: "Apa manfaat Atomy " + p.name + "?", acceptedAnswer: { "@type": "Answer", text: p.manfaat } },
    { "@type": "Question", name: "Apakah halaman " + p.name + " ini situs resmi Atomy?", acceptedAnswer: { "@type": "Answer", text: "Bukan. katalogatomy.online adalah katalog edukatif manfaat dan dosis, bukan toko resmi Atomy dan bukan nasihat medis." } }
  ];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Katalog", item: SITE + "/katalog.html" },
          { "@type": "ListItem", position: 3, name: p.name, item: p.url }
        ]
      },
      {
        "@type": "Product",
        name: "Atomy " + p.name,
        description: p.manfaat,
        image: SITE + "/" + p.img,
        brand: { "@type": "Brand", name: "Atomy" },
        category: p.tag,
        url: p.url
      },
      { "@type": "FAQPage", mainEntity: faqLd }
    ]
  };
  const wa =
    "https://wa.me/" +
    WA +
    "?text=" +
    encodeURIComponent("Halo, saya tertarik Atomy " + p.name + " dari katalogatomy.online. Boleh info stok dan harga?");
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} | Katalog Atomy Indonesia</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="${p.url}" />
  <link rel="alternate" hreflang="id" href="${p.url}" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:site_name" content="Katalog Atomy Indonesia" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${p.url}" />
  <meta property="og:image" content="${SITE}/${p.img}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="/css/style.css" />
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <header>
    <div class="wrap nav">
      <a class="brand" href="/"><div class="logo">AT</div><div><b>ATOMY</b><small>Katalog Indonesia</small></div></a>
      <a href="/katalog.html">Semua produk</a>
    </div>
  </header>
  <main class="wrap" style="padding:2rem 0;max-width:760px">
    <nav aria-label="breadcrumb"><a href="/">Beranda</a> › <a href="/katalog.html">Katalog</a> › ${esc(p.name)}</nav>
    <p class="tag">${esc(p.tag)}</p>
    <h1>Atomy ${esc(p.name)}: manfaat, cara pakai, dan dosis</h1>
    <p>Ringkasan edukatif Atomy ${esc(p.name)} (${esc(p.tag)}) dalam bahasa Indonesia. ${esc(note)}</p>
    <picture>
      <source srcset="/${webp}" type="image/webp" />
      <img src="/${p.img}" alt="Atomy ${esc(p.name)} — ${esc(p.tag)}" width="640" height="640" style="max-width:100%;height:auto" />
    </picture>
    <h2>Manfaat</h2>
    <p>${esc(p.manfaat)}</p>
    <h2>Cara pakai dan dosis</h2>
    <p>${esc(p.dosis)}</p>
    ${extra}
    <h2>Catatan</h2>
    <p>Suplemen dan kosmetik bukan obat. Utamakan petunjuk pada kemasan dan izin BPOM. Konsultasi dokter jika hamil, menyusui, anak, atau sedang terapi. Katalog edukatif, bukan situs resmi Atomy.</p>
    <h2>Produk terkait</h2>
    <ul>
${relatedHtml}
    </ul>
    <p><a href="${wa}" target="_blank" rel="noopener">Tanya stok via WhatsApp</a> · <a href="/katalog.html">Daftar semua produk</a></p>
  </main>
  <footer>
    <div class="wrap foot"><p>Katalog edukatif Atomy Indonesia. Bukan situs resmi Atomy Co., Ltd. dan bukan nasihat medis.</p></div>
  </footer>
</html>
`;
}

const produkRoot = path.join(root, "produk");
fs.rmSync(produkRoot, { recursive: true, force: true });
for (const p of items) {
  const dir = path.join(produkRoot, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(p));
}

const list = items
  .map(
    (p) =>
      "<article><h2><a href=\"/produk/" +
      p.slug +
      "/\">Atomy " +
      esc(p.name) +
      "</a></h2><p><strong>" +
      esc(p.tag) +
      ".</strong> " +
      esc(p.manfaat) +
      " <strong>Cara pakai:</strong> " +
      esc(p.dosis) +
      "</p></article>"
  )
  .join("\n");

const katalog = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Daftar lengkap produk Atomy Indonesia | Manfaat dan dosis</title>
  <meta name="description" content="Daftar ${items.length} produk Atomy Indonesia: manfaat, cara pakai, dan dosis. HemoHIM, vitamin C Colorfood, noni, ginseng, omega-3, dan Absolute CellActive." />
  <link rel="canonical" href="${SITE}/katalog.html" />
  <meta name="robots" content="index,follow" />
  <meta property="og:title" content="Daftar lengkap produk Atomy Indonesia" />
  <meta property="og:description" content="Manfaat, cara pakai, dan dosis ${items.length} produk Atomy dalam bahasa Indonesia." />
  <meta property="og:url" content="${SITE}/katalog.html" />
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
  <header>
    <div class="wrap nav">
      <a class="brand" href="/"><div class="logo">AT</div><div><b>ATOMY</b><small>Katalog Indonesia</small></div></a>
      <a href="/">Katalog visual</a>
    </div>
  </header>
  <main class="wrap" style="padding:2rem 0;max-width:760px">
    <h1>Daftar produk Atomy Indonesia</h1>
    <p>Manfaat, cara pakai, dan dosis ${items.length} produk. Bukan situs resmi Atomy dan bukan nasihat medis. Mulai dari <a href="/produk/hemohim/">HemoHIM</a>, <a href="/produk/vital-color-vitamin-c/">Vitamin C Colorfood</a>, <a href="/produk/organic-fermented-noni/">Noni fermentasi</a>, dan <a href="/produk/rtg-omega-3/">Omega-3 rTG</a>.</p>
    ${list}
  </main>
</body>
</html>
`;
fs.writeFileSync(path.join(root, "katalog.html"), katalog);

const boost = new Set([11, 3, 34, 14, 30, 56, 22, 0, 16]);
const urls = [{ loc: SITE + "/", pri: "1.0", freq: "weekly" }, { loc: SITE + "/katalog.html", pri: "0.9", freq: "weekly" }].concat(
  items.map((p) => ({
    loc: p.url,
    pri: p.id === 17 ? "0.9" : boost.has(p.id) ? "0.8" : "0.7",
    freq: "monthly"
  }))
);
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(
      (u) =>
        "  <url><loc>" +
        u.loc +
        "</loc><lastmod>" +
        today +
        "</lastmod><changefreq>" +
        u.freq +
        "</changefreq><priority>" +
        u.pri +
        "</priority></url>"
    )
    .join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

console.log("pages", items.length);
console.log("sitemap", urls.length);
console.log(items.find((p) => p.name === "HemoHIM").url);
console.log(items.find((p) => p.name === "Probiotics 10+").slug);
