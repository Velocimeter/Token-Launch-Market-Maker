import * as fs from 'fs';

interface OrderRange {
  bottomRange: {
    low: number;
    high: number;
  };
  topRange: {
    low: number;
    high: number;
  };
  tokens: number;
}

function generateRecurringOrders(startPrice: number, endPrice: number, totalTokens: number, numOrders: number): OrderRange[] {
  const orders: OrderRange[] = [];
  const tokensPerOrder = totalTokens / numOrders;

  function createOrderRanges(low: number, high: number, remainingOrders: number): void {
    if (remainingOrders === 0) return;

    const mid = (low + high) / 2;

    // Create the order for the current range
    orders.push({
      bottomRange: {
        low: parseFloat(low.toFixed(10)),
        high: parseFloat(mid.toFixed(10)),
      },
      topRange: {
        low: parseFloat(mid.toFixed(10)),
        high: parseFloat(high.toFixed(10)),
      },
      tokens: tokensPerOrder,
    });

    // Recursively create further orders if there are orders left
    createOrderRanges(low, mid, remainingOrders - 1);
    createOrderRanges(mid, high, remainingOrders - 1);
  }

  createOrderRanges(startPrice, endPrice, numOrders);

  // Ensure we only return the requested number of orders
  return orders.slice(0, numOrders);
}

// Example usage
const startPrice = 0.0000000069;
const endPrice = 0.000000042;
const totalTokens = 1000000000; // 1 billion tokens
const numOrders = 25; // Reduced number of orders
const orders = generateRecurringOrders(startPrice, endPrice, totalTokens, numOrders);

// Generate CSV content
const csvContent = orders.map(order => {
  return `${order.bottomRange.low.toFixed(10)},${order.bottomRange.high.toFixed(10)},${order.topRange.low.toFixed(10)},${order.topRange.high.toFixed(10)},${order.tokens}`;
}).join('\n');

const header = "Bottom Range Low,Bottom Range High,Top Range Low,Top Range High,Tokens\n";
const csv = header + csvContent;

fs.writeFileSync('src/orders.csv', csv);

console.log('Orders CSV file has been generated.');
