import { createSign } from "node:crypto";

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";
const apiKey = process.env.GOOGLE_SHEETS_API_KEY ?? "";
const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "";

export type ApiCell = {
  value: string;
  formula: string;
  hyperlink: string;
};

type GridData = {
  rowData?: Array<{
    values?: Array<{
      formattedValue?: string;
      userEnteredValue?: { stringValue?: string; numberValue?: number; boolValue?: boolean; formulaValue?: string };
      hyperlink?: string;
    }>;
  }>;
};

type SheetResponse = {
  sheets?: Array<{
    properties?: { sheetId?: number; title?: string };
    data?: GridData[];
  }>;
};

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken(): Promise<string> {
  if (!serviceAccountEmail || !serviceAccountPrivateKey) return "";

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(serviceAccountPrivateKey.replace(/\\n/g, "\n"), "base64url");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    cache: "no-store",
  });
  if (!tokenRes.ok) throw new Error(`Google OAuth token request failed: ${tokenRes.status}`);
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Google OAuth response did not contain access_token");
  return token.access_token;
}

function cellToApiCell(cell: NonNullable<NonNullable<GridData["rowData"]>[number]["values"]>[number]): ApiCell {
  const entered = cell.userEnteredValue ?? {};
  const raw = entered.stringValue ?? (entered.numberValue !== undefined ? String(entered.numberValue) : entered.boolValue !== undefined ? String(entered.boolValue) : "");
  return {
    value: cell.formattedValue ?? raw,
    formula: entered.formulaValue ?? "",
    hyperlink: cell.hyperlink ?? "",
  };
}

export async function getSheetRows(sheetGid: string, sheetName?: string): Promise<ApiCell[][]> {
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not configured");
  if (!sheetGid && !sheetName) throw new Error("A sheet GID or sheet name is required");

  const accessToken = await getAccessToken();
  const params = new URLSearchParams({
    includeGridData: "true",
    fields: "sheets.properties,sheets.data.rowData.values.formattedValue,sheets.data.rowData.values.userEnteredValue,sheets.data.rowData.values.hyperlink",
  });
  if (apiKey && !accessToken) params.set("key", apiKey);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?${params.toString()}`;
  const res = await fetch(url, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Google Sheets API failed (${res.status}): ${detail.slice(0, 500)}`);
  }

  const data = (await res.json()) as SheetResponse;
  const sheet = data.sheets?.find((item) => {
    const props = item.properties ?? {};
    return (sheetGid && String(props.sheetId) === String(sheetGid)) || (!sheetGid && props.title === sheetName);
  });
  if (!sheet) throw new Error(`Google Sheet tab not found: ${sheetGid || sheetName}`);

  const grid = sheet.data?.[0]?.rowData ?? [];
  return grid.map((row) => (row.values ?? []).map(cellToApiCell));
}
