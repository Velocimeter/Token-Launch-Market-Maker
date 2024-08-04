import * as fs from 'fs';
import * as path from 'path';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { generateRecurringOrders } from './generateOrders';

// Define types for depth chart data
interface DepthChartData {
  price: number;
  tokens: number;
  wethAvailable: number;
}

// Function to generate depth chart
function generateDepthChart(startPrice: number, endPrice: number, totalTokens: number, numOrders: number): DepthChartData[] {
  const orders = generateRecurringOrders(startPrice, endPrice, totalTokens, numOrders);

  const depthChart: DepthChartData[] = orders.map(order => ({
    price: parseFloat(((order.bottomRangeHigh + order.bottomRangeLow) / 2).toFixed(10)),
    tokens: parseFloat(order.tokens.toFixed(10)),
    wethAvailable: parseFloat(order.wethAvailable.toFixed(10)),
  }));

  return depthChart;
}

// Function to get the next file number
function getNextFileNumber(basePath: string, baseName: string): number {
  const files = fs.readdirSync(basePath);
  const regex = new RegExp(`${baseName}_(\\d+)\\.(json|png)`);
  const numbers = files
    .map(file => {
      const match = file.match(regex);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(num => num !== null) as number[];

  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

// Example usage
const startPrice = 0.0000000042;
const endPrice = 0.000000069;
const totalTokens = 1000000000; // 1 billion tokens
const numOrders = 25;
const depthChart = generateDepthChart(startPrice, endPrice, totalTokens, numOrders);

// Output the depth chart data to JSON with incremented file name
const basePath = path.resolve(__dirname, '../');
const fileNumber = getNextFileNumber(basePath, 'depthChart');
const jsonFileName = `depthChart_${fileNumber}.json`;
fs.writeFileSync(path.join(basePath, jsonFileName), JSON.stringify(depthChart, null, 2));
console.log(`Depth chart JSON file has been generated at ${jsonFileName}`);

// Load depth chart data for visualization
const labels = depthChart.map((data: DepthChartData) => data.price.toFixed(10));
const tokensData = depthChart.map((data: DepthChartData) => data.tokens);
const wethData = depthChart.map((data: DepthChartData) => data.wethAvailable);

const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

const configuration: ChartConfiguration<'line'> = {
  type: 'line',
  data: {
    labels: labels,
    datasets: [
      {
        label: 'Tokens Available',
        data: tokensData,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'WETH Available',
        data: wethData,
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        yAxisID: 'y-axis-2',
      },
    ],
  },
  options: {
    scales: {
      'y-axis-1': {
        type: 'linear',
        position: 'left',
      },
      'y-axis-2': {
        type: 'linear',
        position: 'right',
      },
    },
  },
};

// Render the chart and save as an image with incremented file name
(async () => {
  const image = await chartJSNodeCanvas.renderToBuffer(configuration as ChartConfiguration);
  const imageFileName = `depthChart_${fileNumber}.png`;
  fs.writeFileSync(path.join(basePath, imageFileName), image);
  console.log(`Depth chart image has been generated at ${imageFileName}`);
})();
