import * as fs from 'fs';
import * as path from 'path';

// Define types for orders
interface Order {
  bottomRangeLow: number;
  bottomRangeHigh: number;
  topRangeLow: number;
  topRangeHigh: number;
  tokens: number;
}

// Improved function to generate recurring orders
function generateRecurringOrders(startPrice: number, endPrice: number, totalTokens: number, numOrders: number): Order[] {
  const orders: Order[] = [];
  const tokensPerOrder = totalTokens / numOrders;

  function createOrderRanges(low: number, high: number, remainingOrders: number): void {
    if (remainingOrders === 0) return;

    const mid = (high + low) / 2;

    orders.push({
      bottomRangeLow: parseFloat(low.toFixed(10)),
      bottomRangeHigh: parseFloat(mid.toFixed(10)),
      topRangeLow: parseFloat(mid.toFixed(10)),
      topRangeHigh: parseFloat(high.toFixed(10)),
      tokens: tokensPerOrder,
    });

    createOrderRanges(low, mid, remainingOrders - 1);
    createOrderRanges(mid, high, remainingOrders - 1);
  }

  createOrderRanges(startPrice, endPrice, numOrders);

  return orders.slice(0, numOrders);
}

// Example usage
const startPrice = 0.0000000042;
  const endPrice = 0.000000069;
const totalTokens = 1000000000; // 1 billion tokens
const numOrders = 25;
const orders = generateRecurringOrders(startPrice, endPrice, totalTokens, numOrders);

// Generate CSV content
const csvContent = orders.map(order => {
  return `${order.bottomRangeLow.toFixed(10)},${order.bottomRangeHigh.toFixed(10)},${order.topRangeLow.toFixed(10)},${order.topRangeHigh.toFixed(10)},${order.tokens}`;
}).join('\n');

const header = "Bottom Range Low,Bottom Range High,Top Range Low,Top Range High,Tokens\n";
const csv = header + csvContent;

const outputPath = path.join(__dirname, 'orders.csv');
fs.writeFileSync(outputPath, csv);

console.log(`Orders CSV file has been generated at ${outputPath}`);

