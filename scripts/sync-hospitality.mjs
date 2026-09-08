/**
 * Sync Google Sheets `City_Hospitality_Tourism_Sept` tab
 * -> src/data/hospitality.generated.ts
 * Run: npm run sync-hospitality
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const outPath = path.join(root, 'src', 'data', 'hospitality.generated.ts');

const HOSPITALITY_SHEET_NAME = 'City_Hospitality_Tourism_Sept';
/** Same spreadsheet as Filterable August Sept Events. */
const HOSPITALITY_SPREADSHEET_ID = '1DPgR56Fl7Y47x1ILoa9ek-2eg7AL6RbcHuX_h-Pu3nY';
const API_KEY_PLACEHOLDER = 'YOUR_GOOGLE_SHEETS_API_KEY_HERE';

const COLUMN_ALIASES = {
  city: ['city'],
  business: ['business', 'businessname', 'name'],
  venueType: ['venuetype', 'type'],
  uiCategory: ['uicategory', 'category'],
  audienceTag: ['audiencetag', 'audience', 'tags'],
  description: ['description', 'desc'],
  venueName: ['venuename'],
  venueAddress: ['venueaddress', 'address', 'location'],
  nearbyStation: ['nearbystation', 'station', 'metro', 'neareststation'],
  price: ['generalticketprice', 'price', 'ticketprice'],
  communityPerk: ['communityperk', 'perk'],
  code: ['code', 'discountcode', 'promocode'],
  bookingLink: ['bookinglink', 'booking', 'booklink', 'url', 'website'],
  prideSeries: ['blackpridefestival', 'blackpride', 'pridefestival', 'festival'],
};

function loadDotEnv() {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex < 0) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function requiredEnv(name, placeholder) {
  const value = process.env[name]?.trim() ?? '';
  if (!value || value === placeholder) {
    throw new Error(`Add ${name} to .env before running sync-hospitality.`);
  }
  return value;
}

function normalizeHeader(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function cleanCellValue(value) {
  const cell = String(value ?? '').trim();
  return cell.toLowerCase() === 'nan' ? '' : cell;
}

function normalizeToken(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return (
    String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'hospitality'
  );
}

function parseBoolean(value) {
  const normalized = normalizeToken(value);
  return ['true', 'yes', 'y', '1'].includes(normalized);
}

function parseAudienceTags(value) {
  return String(value ?? '')
    .split(/[,;/|]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function findHeaderRowIndex(rows) {
  for (let i = 0; i < Math.min(rows.length, 40); i += 1) {
    const headers = (rows[i] ?? []).map(normalizeHeader);
    const hasBusiness = headers.some((h) => h === 'business' || h === 'businessname');
    const hasVenueType = headers.some((h) => h === 'venuetype' || h === 'type');
    if (hasBusiness && hasVenueType) return i;
  }
  return -1;
}

function readCell(headers, row, key) {
  for (const alias of COLUMN_ALIASES[key]) {
    const index = headers.indexOf(normalizeHeader(alias));
    if (index >= 0) return cleanCellValue(row[index]);
  }
  return '';
}

function parseHospitalityRows(values) {
  const headerRowIndex = findHeaderRowIndex(values);
  if (headerRowIndex < 0) {
    throw new Error(
      `Could not find header row with Business + Venue Type on ${HOSPITALITY_SHEET_NAME}.`,
    );
  }

  const headerRow = values[headerRowIndex] ?? [];
  const headers = headerRow.map(normalizeHeader);
  const dataRows = values.slice(headerRowIndex + 1);

  return dataRows
    .map((row, index) => {
      const business = readCell(headers, row, 'business');
      const venueType = readCell(headers, row, 'venueType');
      if (!business && !venueType) return null;

      const venueName = readCell(headers, row, 'venueName') || business;
      const title = venueName || business;
      if (!title) return null;

      return {
        id: `hospitality-${slugify(title)}-${index + 1}`,
        city: readCell(headers, row, 'city'),
        business,
        venueType,
        uiCategory: readCell(headers, row, 'uiCategory'),
        audienceTags: parseAudienceTags(readCell(headers, row, 'audienceTag')),
        description: readCell(headers, row, 'description'),
        venueName,
        venueAddress: readCell(headers, row, 'venueAddress'),
        nearbyStation: readCell(headers, row, 'nearbyStation'),
        price: readCell(headers, row, 'price'),
        hasCommunityPerk: parseBoolean(readCell(headers, row, 'communityPerk')),
        code: readCell(headers, row, 'code'),
        bookingLink: readCell(headers, row, 'bookingLink'),
        prideSeries: readCell(headers, row, 'prideSeries'),
      };
    })
    .filter(Boolean);
}

async function fetchHospitalityValues(spreadsheetId, apiKey) {
  const range = /^[A-Za-z0-9_]+$/.test(HOSPITALITY_SHEET_NAME)
    ? HOSPITALITY_SHEET_NAME
    : `'${HOSPITALITY_SHEET_NAME.replace(/'/g, "''")}'`;
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
  );
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? `Unable to load ${HOSPITALITY_SHEET_NAME}.`);
  }
  return payload.values ?? [];
}

loadDotEnv();

const apiKey = requiredEnv('VITE_GOOGLE_SHEETS_API_KEY', API_KEY_PLACEHOLDER);
const values = await fetchHospitalityValues(HOSPITALITY_SPREADSHEET_ID, apiKey);
const items = parseHospitalityRows(values);

if (items.length === 0) {
  throw new Error('No hospitality rows found after parsing.');
}

const file = `/* eslint-disable */
// Auto-generated by scripts/sync-hospitality.mjs from the Google Sheets ${HOSPITALITY_SHEET_NAME} tab. Do not edit by hand.
import type { HospitalityItem } from '../types/hospitality';

export const generatedHospitalityItems: HospitalityItem[] = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync(outPath, file);
const hotelCount = items.filter((item) => normalizeToken(item.venueType) === 'hotel').length;
console.log(`Wrote ${path.relative(root, outPath)} items: ${items.length} (hotels: ${hotelCount})`);
