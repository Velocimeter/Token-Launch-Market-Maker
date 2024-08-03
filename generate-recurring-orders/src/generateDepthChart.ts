import * as fs from 'fs';
import * as path from 'path';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import readline from 'readline';

// Define types for orders
interface Order {
  bottomRangeLow: number;
  bottomRangeHigh: number;
  topRangeLow: number;
  topRangeHigh: number;
  tokens: number;
}

// Prepare data for the depth chart
const prices: number[] = [];
const tokens: number[] = [];
let cumulativeTokens = 0;

// Read and parse the CSV file line by line
const csvFilePath = path.join(__dirname, 'orders.csv');
const rl = readline.createInterface({
  input: fs.createReadStream(csvFilePath),
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (line.startsWith('Bottom Range Low')) {
    // Skip the header line
    return;
  }
  const values = line.split(',').map(value => parseFloat(value));
  const order: Order = {
    bottomRangeLow: values[0],
    bottomRangeHigh: values[1],
    topRangeLow: values[2],
    topRangeHigh: values[3],
    tokens: values[4]
  };
  const midPrice = (order.bottomRangeLow + order.topRangeHigh) / 2;
  cumulativeTokens += order.tokens;
  prices.push(midPrice);
  tokens.push(cumulativeTokens);
});

rl.on('close', async () => {
  // Generate the depth chart after reading the entire file
  const width = 800; // Width of the chart in pixels
  const height = 600; // Height of the chart in pixels
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const configuration: ChartConfiguration<'line'> = {
    type: 'line',
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

  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(path.join(__dirname, 'depth_chart.png'), imageBuffer);
  console.log('Depth chart has been generated.');
});
