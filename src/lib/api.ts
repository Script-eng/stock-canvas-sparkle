// // This is the base URL of your backend server.
// const API_BASE_URL = "http://127.0.0.1:5000/api";

// const getAuthHeaders = () => {
//   const token = import.meta.env.VITE_API_SECRET_TOKEN;
//   if (!token) {
//     console.error("API secret token is missing. Please check your .env.local file.");
//     return {};
//   }
//   return {
//     'Authorization': `Bearer ${token}`,
//     'Content-Type': 'application/json'
//   };
// };

// const fetchFromAPI = async (endpoint: string) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       headers: getAuthHeaders(),
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error(`Failed to fetch from ${endpoint}:`, error);
//     return null;
//   }
// };

// export const getMarketSummary = async () => {
//   const data = await fetchFromAPI('/summary-table');
//   return data?.rows || [];
// };

// export const getMarketMovers = async () => {
//   const data = await fetchFromAPI('/chart-data?agg=D');
//   if (!data || !data.data) return { gainers: [], losers: [] };
//   const gainers = data.data.filter((d: any) => d.performance === 'Gainer');
//   const losers = data.data.filter((d: any) => d.performance === 'Loser')
//                             .sort((a: any, b: any) => a.change_pct - b.change_pct);
//   return { gainers, losers };
// };

// /** 
//  * --- MODIFIED FUNCTION ---
//  * Fetches historical price data for an array of companies.
//  * @param stocks An array of stock objects to fetch history for.
//  * @param agg The aggregation level: 'D' (Daily), 'ME' (Monthly), 'YE' (Yearly)
//  */
// export const getCompanyHistory = async (stocks: any[], agg: 'D' | 'ME' | 'YE') => {
//   // If no stocks are selected, return an empty array to clear the chart
//   if (!stocks || stocks.length === 0) {
//     return [];
//   }
  
//   // Create a comma-separated string of company codes for the API
//   const companyCodes = stocks.map(stock => stock.code).join(',');
  
//   const data = await fetchFromAPI(`/chart-data?agg=${agg}&companies=${companyCodes}`);
//   // Your backend conveniently returns the data in the exact format we need
//   return data?.datasets || [];
// };

// export const getSectorDistribution = async () => {
//   return Promise.resolve([
//     { name: 'Agricultural', value: 25, color: 'hsl(var(--primary))' },
//     { name: 'Financials', value: 35, color: 'hsl(var(--success))' },
//     { name: 'Industrial', value: 15, color: 'hsl(var(--warning))' },
//     { name: 'Consumer', value: 15, color: 'hsl(var(--accent))' },
//     { name: 'Energy', value: 10, color: 'hsl(var(--destructive))' },
//   ]);
// };

// This is the base URL of your backend server.
// const API_BASE_URL = "http://127.0.0.1:5000/api";

// const getAuthHeaders = () => {
//   const token = import.meta.env.VITE_API_SECRET_TOKEN;
//   if (!token) {
//     console.error("API secret token is missing. Please check your .env.local file.");
//     return {};
//   }
//   return {
//     'Authorization': `Bearer ${token}`,
//     'Content-Type': 'application/json'
//   };
// };

// const fetchFromAPI = async (endpoint: string) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       headers: getAuthHeaders(),
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error(`Failed to fetch from ${endpoint}:`, error);
//     return null;
//   }
// };

// export const getMarketSummary = async () => {
//   const data = await fetchFromAPI('/summary-table');
//   return data?.rows || [];
// };

// export const getMarketMovers = async () => {
//   const data = await fetchFromAPI('/chart-data?agg=D');
//   if (!data || !data.data) return { gainers: [], losers: [] };
//   const gainers = data.data.filter((d: any) => d.performance === 'Gainer');
//   const losers = data.data.filter((d: any) => d.performance === 'Loser')
//                             .sort((a: any, b: any) => a.change_pct - b.change_pct);
//   return { gainers, losers };
// };

// /** 
//  * --- MODIFIED FUNCTION ---
//  * Fetches historical price data. Now correctly handles a single ticker string.
//  * @param ticker A single stock symbol string (e.g., "WTK")
//  * @param agg The aggregation level: 'D' (Daily), 'ME' (Monthly), 'YE' (Yearly)
//  */
// export const getCompanyHistory = async (ticker: string, agg: 'D' | 'ME' | 'YE') => {
//   // --- THE FIX IS HERE ---
//   // If no ticker is provided, or it's not a string, return an empty array to prevent errors.
//   if (!ticker || typeof ticker !== 'string') {
//     return [];
//   }
  
//   // The companyCodes variable is now simply the ticker string itself.
//   const companyCodes = ticker;
  
//   const data = await fetchFromAPI(`/chart-data?agg=${agg}&companies=${companyCodes}`);
//   // Your backend returns a 'datasets' array. We only care about the first item for a single stock.
//   const dataset = data?.datasets?.[0];

//   // Return the data points if they exist, otherwise return an empty array.
//   return dataset?.dataPoints || [];
// };

// export const getSectorDistribution = async () => {
//   return Promise.resolve([
//     { name: 'Agricultural', value: 25, color: 'hsl(var(--primary))' },
//     { name: 'Financials', value: 35, color: 'hsl(var(--success))' },
//     { name: 'Industrial', value: 15, color: 'hsl(var(--warning))' },
//     { name: 'Consumer', value: 15, color: 'hsl(var(--accent))' },
//     { name: 'Energy', value: 10, color: 'hsl(var(--destructive))' },
//   ]);
// };


// This is the base URL of your backend server.
const API_BASE_URL = "http://127.0.0.1:5000/api";

const getAuthHeaders = () => {
  const token = import.meta.env.VITE_API_SECRET_TOKEN;
  if (!token) {
    console.error("API secret token is missing. Please check your .env.local file.");
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const fetchFromAPI = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    return null;
  }
};

// export const getMarketSummary = async () => {
//   const data = await fetchFromAPI('/summary-table');
//   return data?.rows || [];
// };
export const getMarketSummary = async (sortBy = 'name', sortOrder = 'asc') => {
  const data = await fetchFromAPI(`/summary-table?sortBy=${sortBy}&sortOrder=${sortOrder}`);
  return data?.rows || [];
};

export const getMarketMovers = async () => {
  const data = await fetchFromAPI('/chart-data?agg=D');
  if (!data || !data.data) return { gainers: [], losers: [] };
  const gainers = data.data.filter((d: any) => d.performance === 'Gainer');
  const losers = data.data.filter((d: any) => d.performance === 'Loser')
                            .sort((a: any, b: any) => a.change_pct - b.change_pct);
  return { gainers, losers };
};

/** 
 * --- MODIFIED FUNCTION ---
 * Fetches historical price data for an array of stocks.
 * @param stocks An array of stock objects to fetch history for.
 * @param agg The aggregation level: 'D' (Daily), 'ME' (Monthly), 'YE' (Yearly)
 */
export const getCompanyHistory = async (stocks: any[], agg: 'D' | 'ME' | 'YE') => {
  // If no stocks are selected, return an empty array to clear the chart
  if (!stocks || stocks.length === 0) {
    return [];
  }

  
  // Create a comma-separated string of company codes for the API
  const companyCodes = stocks.map(stock => stock.code).join(',');
  
  const data = await fetchFromAPI(`/chart-data?agg=${agg}&companies=${companyCodes}`);
  // Your backend conveniently returns the data in the exact format we need
  return data?.datasets || [];
};



export const getSectorDistribution = async () => {
  return Promise.resolve([
    { name: 'Agricultural', value: 25, color: 'hsl(var(--primary))' },
    { name: 'Financials', value: 35, color: 'hsl(var(--success))' },
    { name: 'Industrial', value: 15, color: 'hsl(var(--warning))' },
    { name: 'Consumer', value: 15, color: 'hsl(var(--accent))' },
    { name: 'Energy', value: 10, color: 'hsl(var(--destructive))' },
  ]);
};