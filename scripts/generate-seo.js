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

const used = new Set();
const items = products.map((p) => {
  let slug = slugify(p.name);
  if (used.has(slug)) slug = slug + "-" + p.id;
  used.add(slug);
  return Object.assign({}, p, { slug: slug, url: SITE + "/produk/" + slug + "/" });
});

function page(p) {
  const title = "Atomy " + p.name + ": Manfaat, Cara Pakai & Dosis";
  const desc = clip(p.manfaat + " Dosis: " + p.dosis, 155);
  const related = items.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  const relatedHtml = related
    .map((r) => '<li><a href="/produk/' + r.slug + '/">Atomy ' + esc(r.name) + "</a> — " + esc(r.tag) + "</li>")
    .join("\n");
  const faqLd = [
    { "@type": "Question", name: "Cara pakai " + p.name + "?", acceptedAnswer: { "@type": "Answer", text: p.dosis } },
    { "@type": "Question", name: "Apa manfaat Atomy " + p.name + "?", acceptedAnswer: { "@type": "Answer", text: p.manfaat } },
  ];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Katalog", item: SITE + "/katalog.html" },
          { "@type": "ListItem", position: 3, name: p.name, item: p.url },
        ],
      },
      {
        "@type": "Product",
        name: "Atomy " + p.name,
        description: p.manfaat,
        image: SITE + "/" + p.img,
        brand: { "@type": "Brand", name: "Atomy" },
        category: p.tag,
        url: p.url,
      },
      { "@type": "FAQPage", mainEntity: faqLd },
    ],
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
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${p.url}" />
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
    <h1>Atomy ${esc(p.name)}</h1>
    <img src="/${p.img}" alt="Atomy ${esc(p.name)} — ${esc(p.tag)}" width="640" height="480" style="max-width:100%;height:auto" />
    <h2>Manfaat</h2>
    <p>${esc(p.manfaat)}</p>
    <h2>Cara pakai dan dosis</h2>
    <p>${esc(p.dosis)}</p>
    <h2>Catatan</h2>
    <p>Suplemen dan kosmetik bukan obat. Utamakan petunjuk pada kemasan dan izin BPOM. Konsultasi dokter jika hamil, menyusui, anak, atau sedang terapi. Katalog edukatif, bukan situs resmi Atomy.</p>
    <h2>Produk terkait</h2>
    <ul>
${relatedHtml}
    </ul>
    <p><a href="${wa}" target="_blank" rel="noopener">Tanya stok via WhatsApp</a> · <a href="/?produk=${p.slug}">Buka di katalog visual</a></p>
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
      "</strong></p><p><strong>Manfaat.</strong> " +
      esc(p.manfaat) +
      "</p><p><strong>Dosis.</strong> " +
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
  <meta name="description" content="Daftar ${items.length} produk Atomy Indonesia: manfaat, cara pakai, dan dosis. HemoHIM, vitamin C, noni, ginseng, omega-3, dan Absolute CellActive." />
  <link rel="canonical" href="${SITE}/katalog.html" />
  <meta name="robots" content="index,follow" />
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
    <p>Manfaat, cara pakai, dan dosis. Bukan situs resmi Atomy dan bukan nasihat medis. ${items.length} produk.</p>
    ${list}
  </main>
</body>
</html>
`;
fs.writeFileSync(path.join(root, "katalog.html"), katalog);

const urls = [{ loc: SITE + "/", pri: "1.0", freq: "weekly" }, { loc: SITE + "/katalog.html", pri: "0.9", freq: "weekly" }].concat(
  items.map((p) => ({ loc: p.url, pri: p.id === 17 ? "0.9" : "0.7", freq: "monthly" }))
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

const indexPath = path.join(root, "index.html");
let index = fs.readFileSync(indexPath, "utf8");
const needle = "Absolute CellActive, dan 130+ produk.</p>";
if (index.includes(needle) && !index.includes('href="/katalog.html"')) {
  index = index.replace(
    needle,
    needle + '\n        <p><a href="/katalog.html">Daftar lengkap manfaat dan dosis ' + items.length + " produk</a></p>"
  );
  fs.writeFileSync(indexPath, index);
}

console.log("pages", items.length);
console.log(items.find((p) => p.name === "HemoHIM").url);
console.log(items.find((p) => p.name === "Probiotics 10+").slug);
