const HISTORICAL_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;
const LIVE_API_URL =
  import.meta.env.VITE_LIVE_API_URL;
const LIVE_AUTH_URL =
  import.meta.env.VITE_LIVE_AUTH_URL;

let liveJwtToken: string | null = null;
let liveTokenExpiry: number | null = null;

// --- HISTORICAL AUTH (unchanged) ---
const getAuthHeaders = () => {
  const token = import.meta.env.VITE_API_SECRET_TOKEN;
  if (!token) {
    console.error(
      "API secret token is missing. Please check your .env.local file."
    );
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// --- GENERIC FETCH (historical + live uses this) ---
const fetchFromAPI = async (fullUrl: string, headers: Record<string, string> = {}) => {
  try {
    const response = await fetch(fullUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${fullUrl}:`, error);
    return null;
  }
};

// --- TOKEN HANDLER FOR LIVE DATA ---
async function getLiveToken(): Promise<string> {
  const now = Date.now();

  // Reuse token if still valid
  if (liveJwtToken && liveTokenExpiry && now < liveTokenExpiry) {
    return liveJwtToken;
  }

  const res = await fetch(LIVE_AUTH_URL, { method: "POST" });
  if (!res.ok) {
    throw new Error("Failed to fetch live JWT token");
  }

  const data = await res.json();
  liveJwtToken = data.token;

  // Decode expiry from JWT payload
  const [, payloadBase64] = liveJwtToken.split(".");
  const payload = JSON.parse(atob(payloadBase64));
  liveTokenExpiry = payload.exp * 1000; // ms

  return liveJwtToken!;
}

// ------------------ HISTORICAL DATA ------------------
export const getMarketSummary = async (sortBy = "name", sortOrder = "asc") => {
  const endpoint = `/summary-table?sortBy=${sortBy}&sortOrder=${sortOrder}`;
  const data = await fetchFromAPI(`${HISTORICAL_API_BASE_URL}${endpoint}`, getAuthHeaders());
  return data?.rows || [];
};

export const getMarketMovers = async () => {
  const endpoint = "/chart-data?agg=D";
  const data = await fetchFromAPI(`${HISTORICAL_API_BASE_URL}${endpoint}`, getAuthHeaders());
  if (!data || !data.data) return { gainers: [], losers: [] };
  const gainers = data.data.filter((d: any) => d.performance === "Gainer");
  const losers = data.data
    .filter((d: any) => d.performance === "Loser")
    .sort((a: any, b: any) => a.change_pct - b.change_pct);
  return { gainers, losers };
};

export const getCompanyHistory = async (
  stocks: any[],
  agg: "D" | "ME" | "YE"
) => {
  if (!stocks || stocks.length === 0) {
    return [];
  }
  const companyCodes = stocks.map((stock) => stock.code).join(",");
  const endpoint = `/chart-data?agg=${agg}&companies=${companyCodes}`;
  const data = await fetchFromAPI(`${HISTORICAL_API_BASE_URL}${endpoint}`, getAuthHeaders());
  return data?.datasets || [];
};

// ------------------ MOCKED DATA ------------------
export const getSectorDistribution = async () => {
  return Promise.resolve([
    { name: "Agricultural", value: 25, color: "hsl(var(--primary))" },
    { name: "Financials", value: 35, color: "hsl(var(--success))" },
    { name: "Industrial", value: 15, color: "hsl(var(--warning))" },
    { name: "Consumer", value: 15, color: "hsl(var(--accent))" },
    { name: "Energy", value: 10, color: "hsl(var(--destructive))" },
  ]);
};

// ------------------ LIVE DATA ------------------
export const getLiveMarketData = async () => {
  try {
    const token = await getLiveToken();
    return await fetchFromAPI(LIVE_API_URL, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
  } catch (err) {
    console.error("Failed to fetch live market data:", err);
    return null;
  }
};
