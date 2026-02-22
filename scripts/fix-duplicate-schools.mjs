import fs from "node:fs";

const path = "src/lib/data/schools.json";
const raw = fs.readFileSync(path, "utf8");
const json = JSON.parse(raw);

const listDuplicates = (items, key, label) => {
  const counts = new Map();
  for (const item of items) {
    const value = String(item?.[key] || "").trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  const duplicates = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);

  if (duplicates.length === 0) {
    console.log(`[SYSTEM]: No duplicates for ${label}.`);
    return;
  }

  console.log(`[SYSTEM]: Duplicates for ${label} (${duplicates.length}):`);
  for (const [value, count] of duplicates) {
    console.log(`- ${value} (${count})`);
  }
};

const stop = new Set([
  "of",
  "the",
  "and",
  "for",
  "in",
  "on",
  "at",
  "to",
  "de",
  "la",
  "former",
  "formerly",
]);

const words = (text) =>
  String(text || "")
    .replace(/[()]/g, " ")
    .replace(/&/g, " and ")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

const acronymFromName = (name) => {
  const tokens = words(name).filter((word) => !stop.has(word.toLowerCase()));
  if (tokens.length === 0) return "SCH";
  if (tokens.length === 1) return tokens[0].slice(0, 6).toUpperCase();
  return tokens
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 10);
};

const shortFromDomain = (domain) => {
  const value = String(domain || "").trim();
  if (!value) return "";
  const label = value.split(".")[0];
  return label.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
};

const shortFromUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return shortFromDomain(host);
  } catch {
    return "";
  }
};

const locationTag = (location) =>
  String(location || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 6);

const ensureUnique = (base, used) => {
  if (!used.has(base)) return base;
  let index = 2;
  while (used.has(`${base}${index}`)) {
    index += 1;
  }
  return `${base}${index}`;
};

const used = new Set();
const usedNames = new Set();

const source = json.data || [];
listDuplicates(source, "name", "name");
listDuplicates(source, "short_name", "short_name");

json.data = source.map((school) => {
  const candidates = [
    String(school.short_name || "").trim().toUpperCase(),
    shortFromDomain(school.email_domain),
    shortFromUrl(school.url),
    acronymFromName(school.name),
  ].filter(Boolean);

  let shortName = candidates.find((candidate) => !used.has(candidate));
  if (!shortName) {
    shortName = ensureUnique(candidates[0] || "SCH", used);
  }

  const baseName = String(school.name || "").trim();
  let name = baseName;
  if (usedNames.has(baseName)) {
    const locTag = locationTag(school.location);
    const suffix = locTag ? ` - ${school.location}` : " - Campus";
    name = `${baseName}${suffix}`;
  }

  const locTag = locationTag(school.location);
  if (used.has(shortName) || (locTag && used.has(`${shortName}-${locTag}`))) {
    shortName = locTag ? `${shortName}-${locTag}` : ensureUnique(shortName, used);
  }

  used.add(shortName);
  usedNames.add(name);

  return {
    ...school,
    name,
    short_name: shortName,
  };
});

json.data.sort((a, b) =>
  String(a?.name || "").localeCompare(String(b?.name || ""), "en", {
    sensitivity: "base",
  })
);

fs.writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
console.log(`Updated ${json.data.length} records with unique short_name values.`);
