import * as fs from 'fs';
import * as path from 'path';

// Define types for orders
interface Order {
  bottomRangeLow: number;
  bottomRangeHigh: number;
  topRangeLow: number;
  topRangeHigh: number;
  tokens: number;
  wethAvailable: number;
}

// Function to generate recurring orders based on whitepaper formulas
export function generateRecurringOrders(startPrice: number, endPrice: number, totalTokens: number, numOrders: number): Order[] {
  const orders: Order[] = [];
  const tokensPerOrder = totalTokens / numOrders;
  const priceIncrement = (endPrice - startPrice) / numOrders;

  let accumulatedWETH = 0;

  // Parameters from the whitepaper
  const P0 = startPrice;
  const x0 = totalTokens;
  const Γ = 1;

  for (let i = 0; i < numOrders; i++) {
    const bottomRangeLow = startPrice + (i * priceIncrement);
    const bottomRangeHigh = bottomRangeLow + priceIncrement;
    const topRangeLow = bottomRangeHigh;
    const topRangeHigh = bottomRangeHigh + priceIncrement;

    // Calculate WETH accumulated for this range
    const wethForThisRange = tokensPerOrder * bottomRangeHigh;
    accumulatedWETH += wethForThisRange;

    orders.push({
      bottomRangeLow: parseFloat(bottomRangeLow.toFixed(10)),
      bottomRangeHigh: parseFloat(bottomRangeHigh.toFixed(10)),
      topRangeLow: parseFloat(topRangeLow.toFixed(10)),
      topRangeHigh: parseFloat(topRangeHigh.toFixed(10)),
      tokens: tokensPerOrder,
      wethAvailable: parseFloat(accumulatedWETH.toFixed(10)), // Store accumulated WETH
    });
  }

  return orders;
}

// Example usage for testing
const startPrice = 0.0000000042;
const endPrice = 0.000000069;
const totalTokens = 1000000000; // 1 billion tokens
const numOrders = 50;
const orders = generateRecurringOrders(startPrice, endPrice, totalTokens, numOrders);

// Generate CSV content
const csvContent = orders.map(order => {
  return `${order.bottomRangeLow.toFixed(10)},${order.bottomRangeHigh.toFixed(10)},${order.topRangeLow.toFixed(10)},${order.topRangeHigh.toFixed(10)},${order.tokens},${order.wethAvailable.toFixed(10)}`;
}).join('\n');

const header = "Bottom Range Low,Bottom Range High,Top Range Low,Top Range High,Tokens,WETH Available\n";
const csv = header + csvContent;

const outputPath = path.resolve(__dirname, '../orders.csv'); // Adjusted path to save in parent directory
fs.writeFileSync(outputPath, csv);

console.log(`Orders CSV file has been generated at ${outputPath}`);
