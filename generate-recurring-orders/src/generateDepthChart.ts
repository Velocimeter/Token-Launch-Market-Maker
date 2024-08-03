import * as fs from 'fs';
import * as path from 'path';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration, ChartType } from 'chart.js';

// Define types for orders
interface Order {
  bottomRangeLow: number;
  bottomRangeHigh: number;
  topRangeLow: number;
  topRangeHigh: number;
  tokens: number;
}

// Read and parse the CSV file
const csvFilePath = path.join(__dirname, 'orders.csv');
const csvData = fs.readFileSync(csvFilePath, 'utf8');

const lines = csvData.trim().split('\n');
const headers = lines.shift()?.split(',');

if (!headers) {
  throw new Error('CSV file is missing headers');
}

// Parse the CSV data into an array of objects
const orders: Order[] = lines.map((line: string): Order => {
  const values = line.split(',').map((value: string) => parseFloat(value));
  return {
    bottomRangeLow: values[0],
    bottomRangeHigh: values[1],
    topRangeLow: values[2],
    topRangeHigh: values[3],
    tokens: values[4]
  };
});

// Prepare data for the depth chart
const prices: number[] = [];
const tokens: number[] = [];
let cumulativeTokens = 0;

orders.forEach((order: Order) => {
  const midPrice = (order.bottomRangeLow + order.topRangeHigh) / 2;
  cumulativeTokens += order.tokens;
  prices.push(midPrice);
  tokens.push(cumulativeTokens);
});

// Generate the depth chart
const width = 800; // Width of the chart in pixels
const height = 600; // Height of the chart in pixels
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

const configuration: ChartConfiguration<'line'> = {
  type: 'line' as ChartType,
  data: {
    labels: prices,
    datasets: [{
      label: 'Tokens for Sale',
      data: tokens,
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      fill: false
    }]
  },
  options: {
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Price (WETH)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Tokens for Sale'
        }
      }
    }
  }
};

(async () => {
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(path.join(__dirname, 'depth_chart.png'), imageBuffer);
  console.log('Depth chart has been generated.');
})();
