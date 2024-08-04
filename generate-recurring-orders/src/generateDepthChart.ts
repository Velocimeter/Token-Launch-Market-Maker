import * as fs from 'fs';
import * as path from 'path';
import { generateRecurringOrders } from './generateOrders';

// Function to generate depth chart
function generateDepthChart(startPrice: number, endPrice: number, totalTokens: number, numOrders: number) {
  const orders = generateRecurringOrders(startPrice, endPrice, totalTokens, numOrders);

  const depthChart = orders.map(order => ({
    price: (order.bottomRangeHigh + order.bottomRangeLow) / 2,
    tokens: order.tokens,
    wethAvailable: order.wethAvailable,
  }));

  return depthChart;
}

// Example usage
const startPrice = 0.0000000042;
const endPrice = 0.000000069;
const totalTokens = 1000000000; // 1 billion tokens
const numOrders = 25;
const depthChart = generateDepthChart(startPrice, endPrice, totalTokens, numOrders);

// Output the depth chart data
const outputPath = path.resolve(__dirname, 'depthChart.json');
fs.writeFileSync(outputPath, JSON.stringify(depthChart, null, 2));

console.log(`Depth chart JSON file has been generated at ${outputPath}`);
