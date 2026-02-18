import fs from 'node:fs';

const path = 'src/lib/data/schools.json';
const raw = fs.readFileSync(path, 'utf8');
const json = JSON.parse(raw);

const stop = new Set([
  'of',
  'the',
  'and',
  'for',
  'in',
  'on',
  'at',
  'to',
  'de',
  'la',
  'former',
  'formerly',
]);

const words = (text) =>
  String(text || '')
    .replace(/[()]/g, ' ')
    .replace(/&/g, ' and ')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

const cleanName = (name) => String(name || '').split(',')[0].trim();

const locationFromName = (name) => {
  const text = String(name || '');
  if (!text.includes(',')) return '';
  const parts = text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : '';
};

const shortNameFromName = (name) => {
  const base = cleanName(name);
  const tokens = words(base);
  const significant = tokens.filter((word) => !stop.has(word.toLowerCase()));

  if (significant.length === 0) return 'SCH';
  if (significant.length === 1) return significant[0].slice(0, 4).toUpperCase();

  return significant
    .map((word) => word[0].toUpperCase())
    .join('')
    .slice(0, 8);
};

const emailDomainFromUrl = (url) => {
  const value = String(url || '').trim();
  if (!value) return '';

  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

json.data = (json.data || []).map((school, index) => {
  const short_name = shortNameFromName(school.name);
  const id = `${short_name.toLowerCase()}-${String(index + 1).padStart(3, '0')}`;

  return {
    id,
    name: cleanName(school.name),
    short_name,
    location: locationFromName(school.name),
    email_domain: emailDomainFromUrl(school.url),
    type: school.type ?? '',
    url: school.url ?? '',
    vice_chancellor: school.vice_chancellor ?? '',
    year_of_establishment: String(school.year_of_establishment ?? ''),
  };
});

fs.writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
console.log(`Transformed ${json.data.length} schools`);
