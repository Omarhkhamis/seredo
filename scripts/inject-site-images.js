const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const contentId = "main";
const assetsRoot = path.join(process.cwd(), "public", "assets", "seredo");
const publicPath = (relative) => `/assets/seredo/${relative}`;
const assertExists = (relative) => {
  if (!fs.existsSync(path.join(assetsRoot, relative))) {
    throw new Error(`Missing asset: ${relative}`);
  }

  return publicPath(relative);
};

const government = [
  ["وزارة البلديات والإسكان", "partners/partner-001-ministry-of-housing-6-scaled-e1781591519236.webp"],
  ["NHC", "partners/partner-002-nhc-logo-ntlgreen-h-rgb.webp"],
  ["جهة حكومية", "partners/partner-003-untitled-22-2026-12-10-44.webp"],
  ["غرفة جدة", "partners/partner-004-page-0001-scaled-e1781591478427.webp"],
  ["أمانة جدة", "partners/partner-005-jeddah-municipality-logo-page-0001-scaled-e1781591459845.webp"],
  ["الهيئة العامة للعقار", "partners/partner-006-rega-logo-page-0001-scaled.webp"],
  ["جهة حكومية", "partners/partner-007-60409-e1781591431483.webp"],
  ["غرفة مكة", "partners/partner-008-makkah-chamber-of-commerce-logo.webp"],
].map(([name, logo]) => ({ name, logo: assertExists(logo) }));

const finance = [
  ["بنك البلاد", "partners/partner-013-bank-albilad-logo.webp"],
  ["البنك السعودي للاستثمار", "partners/partner-012-logo.webp"],
  ["البنك الأهلي السعودي", "partners/partner-011-snb-brandmark-artwork-cmyk-primary.webp"],
  ["البنك العربي الوطني", "partners/partner-010-anb-logo-4m-bank-e1781594579153.webp"],
  ["مصرف الإنماء", "partners/partner-009-alinma-bank-logo-cmyk-2-scaled.webp"],
].map(([name, logo]) => ({ name, logo: assertExists(logo) }));

const expFiles = fs
  .readdirSync(path.join(assetsRoot, "exp"))
  .filter((file) => /^exp\d+\.webp$/.test(file))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const exhibitors = expFiles.map((file, index) => ({
  name: `عارض ${String(index + 1).padStart(2, "0")}`,
  logo: assertExists(`exp/${file}`),
}));

const media = [
  ["أملاك", "media-amlak.webp"],
  ["نهدي العقارية", "media-nahdi.webp"],
].map(([name, logo]) => ({ name, logo: assertExists(logo) }));

const injected = {
  assets: {
    logo: assertExists("seredo-logo.webp"),
    heroPoster: assertExists("hero-poster.webp"),
    aboutImage: assertExists("about-expo.webp"),
    networkImage: assertExists("network-city.webp"),
    venueLogo: assertExists("jeddah-superdome.webp"),
    organizerLogo: assertExists("organizer-logo.webp"),
  },
  partnersSection: {
    eyebrow: "",
    title: "شركاء الدورات السابقة",
    description:
      "جهات ساهمت في تعزيز حضور سيريدو عبر دوراته السابقة، ضمن منظومة تجمع الجهات الحكومية، التمويلية، العارضين، والشركاء الإعلاميين.",
    groups: {
      government: { title: "جهات حكومية", countLabel: `${government.length} جهات`, items: government },
      finance: { title: "البنوك وشركات التمويل", countLabel: `${finance.length} جهات`, items: finance },
      exhibitors: { title: "العارضون", countLabel: "شريط متحرك", items: exhibitors },
      media: { title: "الشركاء الإعلاميون", countLabel: "Media Partners", items: media },
    },
  },
};

function mergeContent(current) {
  const next = current && typeof current === "object" && !Array.isArray(current) ? { ...current } : {};
  next.assets = { ...(next.assets || {}), ...injected.assets };
  next.partnersSection = injected.partnersSection;
  return next;
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        id TEXT PRIMARY KEY,
        content JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const result = await pool.query("SELECT content FROM site_content WHERE id = $1", [contentId]);
    const content = mergeContent(result.rows[0]?.content);

    await pool.query(
      `
      INSERT INTO site_content (id, content, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
      `,
      [contentId, JSON.stringify(content)],
    );

    console.log(
      JSON.stringify(
        { government: government.length, finance: finance.length, exhibitors: exhibitors.length, media: media.length },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
