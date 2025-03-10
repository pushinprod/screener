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

export const generateRows = async (
  rowCount: number,
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
    const cells = [
      { id: rowIdx * TOTAL_COLUMNS, v: stock.ticker },
      { id: rowIdx * TOTAL_COLUMNS + 1, v: stock.company_name },
      { id: rowIdx * TOTAL_COLUMNS + 2, v: Math.round(stock.market_cap) },
      { id: rowIdx * TOTAL_COLUMNS + 3, v: Math.round(stock.enterprise_value) },
      // Valuation
      { id: rowIdx * TOTAL_COLUMNS + 4, v: stock.valuation.pe.toFixed(1) },
      { id: rowIdx * TOTAL_COLUMNS + 5, v: stock.valuation.pb.toFixed(1) },
      { id: rowIdx * TOTAL_COLUMNS + 6, v: stock.valuation.ps.toFixed(1) },
      { id: rowIdx * TOTAL_COLUMNS + 7, v: stock.valuation.ev_s.toFixed(1) },
      { id: rowIdx * TOTAL_COLUMNS + 8, v: stock.valuation.ev_fcf.toFixed(1) },
      // Margins
      { id: rowIdx * TOTAL_COLUMNS + 9, v: (stock.margins.gross_margin * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 10, v: (stock.margins.operating_margin * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 11, v: (stock.margins.fcf_margin * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 12, v: (stock.margins.gross_margin_median * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 13, v: (stock.margins.operating_margin_median * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 14, v: (stock.margins.fcf_margin_median * 100).toFixed(1) + '%' },
      // Returns
      { id: rowIdx * TOTAL_COLUMNS + 15, v: (stock.returns.roic * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 16, v: (stock.returns.roa * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 17, v: (stock.returns.roe * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 18, v: (stock.returns.roce * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 19, v: (stock.returns.rotce * 100).toFixed(1) + '%' },
      // Capital Structure
      { id: rowIdx * TOTAL_COLUMNS + 20, v: stock.capital_structure.assets_to_equity.toFixed(2) },
      { id: rowIdx * TOTAL_COLUMNS + 21, v: stock.capital_structure.debt_to_equity.toFixed(2) },
      { id: rowIdx * TOTAL_COLUMNS + 22, v: stock.capital_structure.debt_to_assets.toFixed(2) },
      // Growth
      { id: rowIdx * TOTAL_COLUMNS + 23, v: (stock.growth_10yr.revenue_growth * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 24, v: (stock.growth_10yr.asset_growth * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 25, v: (stock.growth_10yr.eps_growth * 100).toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 26, v: (stock.growth_10yr.fcf_growth * 100).toFixed(1) + '%' },
      // Shareholder Returns
      { id: rowIdx * TOTAL_COLUMNS + 27, v: stock.shareholder_returns.dividend_payout_ratio.toFixed(1) + '%' },
      { id: rowIdx * TOTAL_COLUMNS + 28, v: (stock.shareholder_returns.buybacks * 100).toFixed(1) + '%' }
    ];

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