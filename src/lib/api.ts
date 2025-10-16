import { jwtDecode } from 'jwt-decode';

const HISTORICAL_API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL as string;
const LIVE_AUTH_URL = import.meta.env.VITE_LIVE_AUTH_URL as string;
const MARKET_STATUS_URL = import.meta.env.VITE_MARKET_STATUS_URL as string;
const HISTORICAL_AUTH_LOGIN_URL = `${HISTORICAL_API_BASE_URL}/auth/token`; // Token endpoint for YOUR Flask backend

// In-memory cache for the HISTORICAL data JWT (from your Flask backend)
let historicalJwtToken: string | null = null;
let historicalTokenExpiry: number | null = null; // Stored in milliseconds

// In-memory cache for the LIVE data JWT (from api.softwarepulses.com)
let liveJwtToken: string | null = null;
let liveTokenExpiry: number | null = null; // Stored in milliseconds

// Key for storing the HISTORICAL JWT in localStorage
const LOCAL_STORAGE_HISTORICAL_JWT_KEY = 'historicalAppJwtToken'; 

// --- GENERIC UTILITIES ---
const getStoredHistoricalJwt = (): string | null => localStorage.getItem(LOCAL_STORAGE_HISTORICAL_JWT_KEY);
const setStoredHistoricalJwt = (token: string | null) => {
  if (token) localStorage.setItem(LOCAL_STORAGE_HISTORICAL_JWT_KEY, token);
  else localStorage.removeItem(LOCAL_STORAGE_HISTORICAL_JWT_KEY);
};

// --- AUTHENTICATION FOR YOUR HISTORICAL BACKEND (Flask) ---
async function getHistoricalToken(): Promise<string> {
  const now = Date.now();

  if (historicalJwtToken && historicalTokenExpiry && now < historicalTokenExpiry) return historicalJwtToken;

  let storedToken = getStoredHistoricalJwt();
  if (storedToken) {
    try {
      const decoded: { exp: number } = jwtDecode(storedToken);
      const expiryTime = decoded.exp * 1000;
      if (now < expiryTime) {
        historicalJwtToken = storedToken;
        historicalTokenExpiry = expiryTime;
        return historicalJwtToken;
      }
      console.warn("Stored historical JWT token expired. Fetching a new one.");
      setStoredHistoricalJwt(null);
    } catch (error) {
      console.error("Error decoding stored historical JWT token:", error);
      setStoredHistoricalJwt(null);
    }
  }

  try {
    const res = await fetch(HISTORICAL_AUTH_LOGIN_URL, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to fetch JWT token from ${HISTORICAL_AUTH_LOGIN_URL}. Status: ${res.status}`);

    const data = await res.json();
    if (!data.token) throw new Error("No token received from historical backend.");

    const newToken = data.token;
    const decoded: { exp: number } = jwtDecode(newToken);
    const newExpiryTime = decoded.exp * 1000;

    historicalJwtToken = newToken;
    historicalTokenExpiry = newExpiryTime;
    setStoredHistoricalJwt(newToken);
    console.log("Successfully fetched and stored new historical JWT token.");
    return historicalJwtToken;
  } catch (error) {
    console.error("Historical backend authentication failed:", error);
    throw error;
  }
}

// Headers for HISTORICAL API calls
const getHistoricalAuthHeaders = async () => {
  try {
    const token = await getHistoricalToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("Failed to get JWT token for historical API calls:", error);
    throw error;
  }
};

// --- GENERIC FETCH ---
// Added a generic type T for better type inference with specific API responses
const fetchFromAPI = async <T>(fullUrl: string, headers: Record<string, string> = {}): Promise<T | null> => {
  try {
    const response = await fetch(fullUrl, { headers });
    if (!response.ok) {
      // Specific 401 handling for HISTORICAL API BASE URL only
      if (response.status === 401 && fullUrl.startsWith(HISTORICAL_API_BASE_URL)) {
          console.warn("Received 401 for historical API. Token might be invalid or expired. Clearing token and re-throwing.");
          setStoredHistoricalJwt(null);
          historicalJwtToken = null;
          historicalTokenExpiry = null;
      }
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    return await response.json() as T; // Type assertion
  } catch (error) {
    console.error(`Failed to fetch from ${fullUrl}:`, error);
    return null;
  }
};

// --- TOKEN HANDLER FOR LIVE DATA (api.softwarepulses.com) ---
async function getLiveToken(): Promise<string> {
  const now = Date.now();
  if (liveJwtToken && liveTokenExpiry && now < liveTokenExpiry) return liveJwtToken;

  const res = await fetch(LIVE_AUTH_URL, { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch live JWT token");

  const data = await res.json();
  liveJwtToken = data.token;

  const [, payloadBase64] = liveJwtToken.split(".");
  const payload = JSON.parse(atob(payloadBase64));
  liveTokenExpiry = payload.exp * 1000;

  return liveJwtToken!;
}

// ------------------ TYPE DEFINITIONS FOR HISTORICAL DATA & INDICES ------------------
// Represents a single data point in a time series (e.g., for a chart)
export interface DataPoint {
  date: string; // ISO date string (e.g., "YYYY-MM-DD")
  closing: number;
}

// Represents the summary of a single index as returned by the getIndices API
export interface IndexSummary {
  change_abs: number;
  change_pct: number;
  closing: number; // The sample data uses 'closing'
  name: string;
  performance: "Gainer" | "Loser" | "Neutral"; // Based on your sample data
  // Note: The 'code' property was in your provided interface snippet but not in the sample data.
  // If your actual API for `getIndices` does provide a 'code', add `code: string;` here.
  // For `getHistoricalIndexData`, we assume `indexName` is the same as `IndexSummary.name`.
}

// Represents the full response structure from the getIndices API
export interface IndicesApiResponse {
  data: IndexSummary[]; // The array of index summaries
  title: string;       // The title, e.g., "Major Indices on October 16, 2025"
}

// ------------------ HISTORICAL DATA API FUNCTIONS ------------------
export const getMarketSummary = async (sortBy = "name", sortOrder = "asc") => {
  const endpoint = `/summary-table?sortBy=${sortBy}&sortOrder=${sortOrder}`;
  try {
    const headers = await getHistoricalAuthHeaders(); // Uses HISTORICAL token
    const data = await fetchFromAPI<{rows: any[]}>(`${HISTORICAL_API_BASE_URL}${endpoint}`, headers); // Added type for data
    return data?.rows || [];
  } catch (error) {
    console.error("Failed to fetch market summary due to authentication error:", error);
    return [];
  }
};

export const getMarketMovers = async () => {
  const endpoint = "/chart-data?agg=D";
  try {
    const headers = await getHistoricalAuthHeaders(); // Uses HISTORICAL token
    // Assuming data.data is an array of objects with performance, change_pct, etc.
    const data = await fetchFromAPI<{ data: any[] }>(`${HISTORICAL_API_BASE_URL}${endpoint}`, headers); 
    if (!data || !data.data) return { gainers: [], losers: [] };
    const gainers = data.data.filter((d: any) => d.performance === "Gainer");
    const losers = data.data
      .filter((d: any) => d.performance === "Loser")
      .sort((a: any, b: any) => a.change_pct - b.change_pct);
    return { gainers, losers };
  } catch (error) {
    console.error("Failed to fetch market movers due to authentication error:", error);
    return { gainers: [], losers: [] };
  }
};

// Assuming StockDataset and its DataPoint structure (with string dates)
// This interface might live here or be imported from a shared types file
export interface StockDataset {
  code: string;
  name: string; // Ensure this is present if getCompanyHistory returns it
  dataPoints: DataPoint[]; // Using the DataPoint with string date
}

export const getCompanyHistory = async (
  stocks: { code: string; name?: string }[], // Explicitly type stocks for better safety
  agg: "D" | "ME" | "YE"
): Promise<StockDataset[]> => { // Explicitly type the return
  if (!stocks || stocks.length === 0) return [];
  const companyCodes = stocks.map((stock) => stock.code).join(",");
  const endpoint = `/chart-data?agg=${agg}&companies=${companyCodes}`;
  try {
    const headers = await getHistoricalAuthHeaders(); // Uses HISTORICAL token
    const data = await fetchFromAPI<{ datasets: StockDataset[] }>(`${HISTORICAL_API_BASE_URL}${endpoint}`, headers);
    return data?.datasets || [];
  } catch (error) {
    console.error("Failed to fetch company history due to authentication error:", error);
    return [];
  }
};


// Fetches a summary of all major indices
export const getIndices = async (): Promise<IndicesApiResponse | null> => {
  const endpoint = `/indices`; // This endpoint should return the { data: [...], title: "..." } structure
  try {
    const headers = await getHistoricalAuthHeaders();
    const apiResponse = await fetchFromAPI<IndicesApiResponse>(`${HISTORICAL_API_BASE_URL}${endpoint}`, headers);
    return apiResponse; // Return the entire response object
  } catch (error) {
    console.error("Failed to fetch indices summary:", error);
    return null;
  }
};

// Fetches historical time-series data for a specific index
export const getHistoricalIndexData = async (
  indexName: string, 
  agg: "D" | "ME" | "YE" // Aggregation: Daily, Month-End, Year-End
): Promise<DataPoint[]> => {
  if (!indexName) {
    console.warn("getHistoricalIndexData called without an indexName.");
    return [];
  }
  // Ensure indexName is URL-encoded, especially if it contains spaces or special characters
  const endpoint = `/index-data?agg=${agg}&index=${encodeURIComponent(indexName)}`;
  try {
    const headers = await getHistoricalAuthHeaders();
    // Assuming this endpoint returns an object like { dataPoints: [...] }
    const apiResponse = await fetchFromAPI<{ dataPoints: DataPoint[] }>(`${HISTORICAL_API_BASE_URL}${endpoint}`, headers);
    return apiResponse?.dataPoints || [];
  } catch (error) {
    console.error(`Failed to fetch historical data for index ${indexName}:`, error);
    return [];
  }
};

// ------------------ MOCKED DATA (UNCHANGED) ------------------
export const getSectorDistribution = async () => {
  return Promise.resolve([
    { name: "Agricultural", value: 25, color: "hsl(var(--primary))" },
    { name: "Financials", value: 35, color: "hsl(var(--success))" },
    { name: "Industrial", value: 15, color: "hsl(var(--warning))" },
    { name: "Consumer", value: 15, color: "hsl(var(--accent))" },
    { name: "Energy", value: 10, color: "hsl(var(--destructive))" },
  ]);
};

// ------------------ LIVE DATA (NOW USES ITS OWN TOKEN) ------------------
export const getLiveMarketData = async () => {
  try {
    const token = await getLiveToken(); // Uses LIVE token from api.softwarepulses.com
    return await fetchFromAPI(LIVE_API_URL, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
  } catch (err) {
    console.error("Failed to fetch live market data:", err);
    return null;
  }
};

export const getMarketStatus = async () => {
  try {
    const token = await getLiveToken(); // Uses LIVE token from api.softwarepulses.com
    const data = await fetchFromAPI<{ status: string }>(MARKET_STATUS_URL, { // Added type for data
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
    return data?.status || "unknown";
  } catch (err) {
    console.error("Failed to fetch market status:", err);
    return "unknown";
  }
};

export { getHistoricalToken as authenticateHistoricalBackend };