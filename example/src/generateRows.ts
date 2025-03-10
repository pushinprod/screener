import { isTimeToYield, yieldControl } from "main-thread-scheduling";
import { Grid } from "../../src/grid";
import { Rows } from "../../src/row-manager/row-manager";

async function fetchStocksData() {
  const response = await fetch('/stonks.json');
  const data = await response.json();
  return Object.entries(data).map(([ticker, info]: [string, any]) => ({
    ticker,
    ...info
  }));
}

const TOTAL_COLUMNS = 30;

// Types
type StockData = {
  ticker: string;
  company_name: string;
  market_cap: number;
  enterprise_value: number;
  valuation: {
    pe: number;
    pb: number;
    ps: number;
    ev_s: number;
    ev_fcf: number;
  };
  margins: {
    gross_margin: number;
    operating_margin: number;
    fcf_margin: number;
    gross_margin_median: number;
    operating_margin_median: number;
    fcf_margin_median: number;
  };
  returns: {
    roic: number;
    roa: number;
    roe: number;
    roce: number;
    rotce: number;
  };
  capital_structure: {
    assets_to_equity: number;
    debt_to_equity: number;
    debt_to_assets: number;
  };
  growth_10yr: {
    revenue_growth: number;
    asset_growth: number;
    eps_growth: number;
    fcf_growth: number;
  };
  shareholder_returns: {
    dividend_payout_ratio: number;
    buybacks: number;
  };
};

type Cell = {
  id: number;
  v: string | number;
};

// Formatting helpers
const formatters = {
  percentage: (value: number, decimals = 1) => 
    `${(value * 100).toFixed(decimals)}%`,
  
  ratio: (value: number, decimals = 2) => 
    value.toFixed(decimals),
  
  currency: (value: number) => 
    Math.round(value),
  
  text: (value: string) => 
    value
};

// Cell creation helper
const createCell = (rowIdx: number, colIdx: number, value: string | number): Cell => ({
  id: rowIdx * TOTAL_COLUMNS + colIdx,
  v: value
});

// Data transformation functions
const transformValuationMetrics = (rowIdx: number, valuation: StockData['valuation']): Cell[] => {
  const metrics = ['pe', 'pb', 'ps', 'ev_s', 'ev_fcf'] as const;
  return metrics.map((metric, idx) => 
    createCell(rowIdx, idx + 4, formatters.ratio(valuation[metric]))
  );
};

const transformMargins = (rowIdx: number, margins: StockData['margins']): Cell[] => {
  const currentMargins = ['gross_margin', 'operating_margin', 'fcf_margin'] as const;
  const medianMargins = currentMargins.map(m => `${m}_median` as const);
  
  return [
    ...currentMargins.map((margin, idx) => 
      createCell(rowIdx, idx + 9, formatters.percentage(margins[margin]))
    ),
    ...medianMargins.map((margin, idx) => 
      createCell(rowIdx, idx + 12, formatters.percentage(margins[margin]))
    )
  ];
};

// Main cell generation
const generateCells = (rowIdx: number, stock: StockData): Cell[] => [
  // Company Info
  createCell(rowIdx, 0, formatters.text(stock.ticker)),
  createCell(rowIdx, 1, formatters.text(stock.company_name)),
  createCell(rowIdx, 2, formatters.currency(stock.market_cap)),
  createCell(rowIdx, 3, formatters.currency(stock.enterprise_value)),
  
  // Valuation
  ...transformValuationMetrics(rowIdx, stock.valuation),
  
  // Margins
  ...transformMargins(rowIdx, stock.margins),
  
  // Returns
  ...Object.entries(stock.returns).map(([_, value], idx) =>
    createCell(rowIdx, idx + 15, formatters.percentage(value))
  ),
  
  // Capital Structure
  ...Object.entries(stock.capital_structure).map(([_, value], idx) =>
    createCell(rowIdx, idx + 20, formatters.ratio(value))
  ),
  
  // Growth
  ...Object.entries(stock.growth_10yr).map(([_, value], idx) =>
    createCell(rowIdx, idx + 23, formatters.percentage(value))
  ),
  
  // Shareholder Returns
  createCell(rowIdx, 27, formatters.percentage(stock.shareholder_returns.dividend_payout_ratio / 100)),
  createCell(rowIdx, 28, formatters.percentage(stock.shareholder_returns.buybacks))
];

export const generateRows = async (
  grid: Grid,
  cb: () => void
) => {
  const stocksData = await fetchStocksData();
  const rows: Rows = [];

  for (let rowIdx = 0; rowIdx < stocksData.length; rowIdx++) {
    if (rowIdx % 10000 === 0 && isTimeToYield("background")) {
      await yieldControl("background");
      grid.rowManager.setRows(rows, true);
    }

    const stock = stocksData[rowIdx];
    const cells = generateCells(rowIdx, stock);

    rows.push({ id: rowIdx, cells });
  }

  await yieldControl("background");
  grid.rowManager.setRows(rows);
  cb();
};

export const COLUMNS = [
  "Ticker",
  "Company Name",
  "Market Cap (M)",
  "Enterprise Value (M)",
  // Valuation
  "P/E",
  "P/B",
  "P/S",
  "EV/S",
  "EV/FCF",
  // Margins
  "Gross Margin",
  "Operating Margin",
  "FCF Margin",
  "Gross Margin (Median)",
  "Operating Margin (Median)",
  "FCF Margin (Median)",
  // Returns
  "ROIC",
  "ROA",
  "ROE",
  "ROCE",
  "ROTCE",
  // Capital Structure
  "Assets/Equity",
  "Debt/Equity",
  "Debt/Assets",
  // Growth (10yr)
  "Revenue Growth",
  "Asset Growth",
  "EPS Growth",
  "FCF Growth",
  // Shareholder Returns
  "Dividend Payout Ratio",
  "Buybacks"
];