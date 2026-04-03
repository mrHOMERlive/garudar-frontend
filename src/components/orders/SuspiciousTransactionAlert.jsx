import React from 'react';
import { ShieldAlert, TrendingUp } from 'lucide-react';

// Deviation threshold: flag if order is >3x the client's average
const DEVIATION_MULTIPLIER = 3;
const MIN_ORDERS_FOR_ANALYSIS = 1;

export function computeClientAverage(allOrders, clientId, excludeOrderId) {
  const clientOrders = allOrders.filter(
    (o) => o.clientId === clientId && o.orderId !== excludeOrderId && !o.deleted && o.amount > 0
  );
  if (clientOrders.length < MIN_ORDERS_FOR_ANALYSIS) return null;
  const total = clientOrders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);
  return total / clientOrders.length;
}

export default function SuspiciousTransactionAlert({ order, allOrders }) {
  if (!order || !allOrders) return null;
  if (order.status !== 'created') return null;

  const avg = computeClientAverage(allOrders, order.clientId, order.orderId);
  if (avg === null) return null; // Not enough history

  const ratio = parseFloat(order.amount) / avg;
  if (ratio < DEVIATION_MULTIPLIER) return null;

  return (
    <div className="flex items-start gap-3 bg-orange-50 border-2 border-orange-300 rounded-lg p-3 my-2">
      <ShieldAlert className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-orange-800 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          Unusual Transaction Amount Detected
        </p>
        <p className="text-xs text-orange-700 mt-1">
          This order (
          <strong>
            {order.currency} {parseFloat(order.amount)?.toLocaleString('en-US')}
          </strong>
          ) is <strong>{ratio.toFixed(1)}x</strong> the client&apos;s average order of{' '}
          <strong>
            {order.currency} {avg.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </strong>
          .
        </p>
        <p className="text-xs text-orange-600 mt-1 italic">
          Please review for possible suspicious transaction. Enhanced verification may be required.
        </p>
      </div>
    </div>
  );
}
