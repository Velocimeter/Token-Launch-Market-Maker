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

  function createOrderRanges(low: number, high: number): void {
    if (orders.length >= numOrders) return; // Stop recursion if numOrders reached

    const mid = (low + high) / 2;

    // Create the order for the current range
    orders.push({
      bottomRange: {
        low: low,
        high: mid,
      },
      topRange: {
        low: mid,
        high: high,
      },
      tokens: tokensPerOrder, // Allocate tokens to each order
    });

    // Recursively create further orders if the range can still be divided and numOrders not reached
    if (orders.length < numOrders && (mid - low) > Number.EPSILON) {
      createOrderRanges(low, mid);
    }
    if (orders.length < numOrders && (high - mid) > Number.EPSILON) {
      createOrderRanges(mid, high);
    }
  }

  createOrderRanges(startPrice, endPrice);

  return orders;
}

// Example usage
const startPrice = 0.0000000069;
const endPrice = 0.000000042;
const totalTokens = 1000000000; // 1 billion tokens
const numOrders = 50;
const orders = generateRecurringOrders(startPrice, endPrice, totalTokens, numOrders);

// Generate CSV content
const csvContent = orders.map(order => {
  return `${order.bottomRange.low},${order.bottomRange.high},${order.topRange.low},${order.topRange.high},${order.tokens}`;
}).join('\n');

const header = "Bottom Range Low,Bottom Range High,Top Range Low,Top Range High,Tokens\n";
const csv = header + csvContent;

const fs = require('fs');
fs.writeFileSync('orders.csv', csv);

console.log('CSV file has been generated.');
