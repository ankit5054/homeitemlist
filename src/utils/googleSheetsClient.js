const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SPREADSHEET_ID = process.env.REACT_APP_SHEET_ID;
const SHEET_NAME = process.env.REACT_APP_SHEET_NAME || 'Sheet1';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

let accessToken = '';
let tokenClient;
let activeSheet;

const loadIdentityScript = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.oauth2) return resolve();
  const existing = document.querySelector('script[data-google-identity]');
  if (existing) { existing.addEventListener('load', resolve, { once: true }); return; }
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.dataset.googleIdentity = 'true';
  script.onload = resolve;
  script.onerror = () => reject(new Error('Could not load Google sign-in.'));
  document.head.appendChild(script);
});

export const isGoogleSheetsConfigured = Boolean(CLIENT_ID && SPREADSHEET_ID);
export const isGoogleSheetsConnected = () => Boolean(accessToken);

export const connectGoogleSheets = async () => {
  if (!CLIENT_ID) throw new Error('Add REACT_APP_GOOGLE_CLIENT_ID to .env first.');
  if (!SPREADSHEET_ID) throw new Error('Add REACT_APP_SHEET_ID to .env first.');
  await loadIdentityScript();
  return new Promise((resolve, reject) => {
    tokenClient = tokenClient || window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: response => {
        if (response.error) return reject(new Error(response.error_description || response.error));
        accessToken = response.access_token;
        resolve(true);
      },
      error_callback: error => reject(new Error(error.message || 'Google authorization was cancelled.'))
    });
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
  });
};

export const disconnectGoogleSheets = () => new Promise(resolve => {
  if (!accessToken || !window.google?.accounts?.oauth2) { accessToken = ''; activeSheet = undefined; resolve(); return; }
  window.google.accounts.oauth2.revoke(accessToken, () => { accessToken = ''; activeSheet = undefined; resolve(); });
});

const apiRequest = async (path, options = {}) => {
  if (!accessToken) throw new Error('Connect your Google account before changing the Sheet.');
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || 'Google Sheets request failed.');
  return body;
};

const getActiveSheet = async () => {
  if (activeSheet) return activeSheet;
  const metadata = await apiRequest('?fields=sheets.properties');
  const sheets = metadata.sheets || [];
  const requested = sheets.find(entry => entry.properties.title.toLowerCase() === SHEET_NAME.toLowerCase());
  activeSheet = requested?.properties || sheets[0]?.properties;
  if (!activeSheet) throw new Error('This spreadsheet does not contain a worksheet.');
  return activeSheet;
};

const a1Range = (sheetTitle, cells) => `'${sheetTitle.replace(/'/g, "''")}'!${cells}`;

const getRows = async () => {
  const sheet = await getActiveSheet();
  const range = encodeURIComponent(a1Range(sheet.title, 'A:C'));
  const data = await apiRequest(`/values/${range}`);
  return { rows: data.values || [], sheet };
};

export const readItemsFromSheet = async () => {
  const { rows } = await getRows();
  return rows.slice(1).filter(row => row[0]).map(row => ({ item: { en: row[0], hi: row[1] || row[0] }, unit: [{ en: row[2] || 'pc' }] }));
};

export const applySheetMutation = async mutation => {
  const { rows, sheet } = await getRows();
  const findRow = name => rows.findIndex((row, index) => index > 0 && String(row[0]).trim() === String(name).trim()) + 1;
  if (mutation.action === 'create') {
    if (findRow(mutation.item.en)) throw new Error('An item with that English name already exists.');
    const range = encodeURIComponent(a1Range(sheet.title, 'A:C'));
    await apiRequest(`/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: 'POST', body: JSON.stringify({ values: [[mutation.item.en, mutation.item.hi, mutation.item.unit]] }) });
  } else if (mutation.action === 'update') {
    const row = findRow(mutation.originalName);
    if (!row) throw new Error('The item to update was not found in the Sheet.');
    const range = encodeURIComponent(a1Range(sheet.title, `A${row}:C${row}`));
    await apiRequest(`/values/${range}?valueInputOption=RAW`, { method: 'PUT', body: JSON.stringify({ values: [[mutation.item.en, mutation.item.hi, mutation.item.unit]] }) });
  } else if (mutation.action === 'delete') {
    const row = findRow(mutation.name);
    if (!row) throw new Error('The item to delete was not found in the Sheet.');
    await apiRequest(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: [{ deleteDimension: { range: { sheetId: sheet.sheetId, dimension: 'ROWS', startIndex: row - 1, endIndex: row } } }] }) });
  }
};
