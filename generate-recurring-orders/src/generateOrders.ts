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

// Function to generate recurring orders based on recursive logic
function generateOrdersForRange(startPrice: number, endPrice: number, totalTokens: number, levels: number): Order[] {
  const orders: Order[] = [];
  const tokensPerOrder = totalTokens / Math.pow(2, levels);

  let accumulatedWETH = 0;

  function createOrderRanges(low: number, high: number, depth: number): void {
    if (depth === 0) return;

    const mid = (high + low) / 2;

    // Debugging prints
    console.log(`low: ${low}, mid: ${mid}, high: ${high}, depth: ${depth}`);

    const wethForThisRange = tokensPerOrder * mid;
    accumulatedWETH += wethForThisRange;

    orders.push({
      bottomRangeLow: parseFloat(low.toFixed(10)),
      bottomRangeHigh: parseFloat(mid.toFixed(10)),
      topRangeLow: parseFloat(mid.toFixed(10)),
      topRangeHigh: parseFloat(high.toFixed(10)),
      tokens: tokensPerOrder,
      wethAvailable: parseFloat(accumulatedWETH.toFixed(10)),
    });

    createOrderRanges(low, mid, depth - 1);
    createOrderRanges(mid, high, depth - 1);
  }

  createOrderRanges(startPrice, endPrice, levels);

  return orders;
}

// Function to generate recurring orders for both ranges
export function generateRecurringOrders(
  floorStartPrice: number, 
  floorEndPrice: number, 
  discoveryStartPrice: number, 
  discoveryEndPrice: number, 
  totalTokens: number, 
  levels: number
): Order[] {
  const floorTokens = totalTokens * 0.2; // 20% of total tokens for floor range
  const discoveryTokens = totalTokens * 0.8; // 80% of total tokens for discovery range

  const floorOrders = generateOrdersForRange(floorStartPrice, floorEndPrice, floorTokens, levels);
  const discoveryOrders = generateOrdersForRange(discoveryStartPrice, discoveryEndPrice, discoveryTokens, levels);

  return [...floorOrders, ...discoveryOrders];
}

// Example usage for testing
const floorStartPrice = 0.00000000069;
const floorEndPrice = 0.0000000042;
const discoveryStartPrice = 0.0000000042;
const discoveryEndPrice = 0.000000069;
const totalTokens = 1000000000; // 1 billion tokens
const levels = 2;
const orders = generateRecurringOrders(floorStartPrice, floorEndPrice, discoveryStartPrice, discoveryEndPrice, totalTokens, levels);

// Generate CSV content
const csvContent = orders.map(order => {
  return `${order.bottomRangeLow.toFixed(10)},${order.bottomRangeHigh.toFixed(10)},${order.topRangeLow.toFixed(10)},${order.topRangeHigh.toFixed(10)},${order.tokens},${order.wethAvailable.toFixed(10)}`;
}).join('\n');

const header = "Bottom Range Low,Bottom Range High,Top Range Low,Top Range High,Tokens,WETH Available\n";
const csv = header + csvContent;

const outputPath = path.resolve(__dirname, '../orders.csv'); // Adjusted path to save in parent directory
fs.writeFileSync(outputPath, csv);

console.log(`Orders CSV file has been generated at ${outputPath}`);
