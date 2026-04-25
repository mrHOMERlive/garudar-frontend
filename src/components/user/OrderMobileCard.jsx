import React from 'react';
import { format } from 'date-fns';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';

/**
 * Generic mobile-card view for order lists.
 *
 * Used as the `md:hidden` counterpart to the desktop `<table>` on
 * OrderHistory, ExecutedOrders, CancelledOrders, DeletedOrders.
 * CurrentOrders uses its own inline OrderCard with section-specific styling.
 *
 * Accepts both camelCase (API shape) and snake_case (UI mapping used by
 * ExecutedOrders/CancelledOrders/DeletedOrders). Falls back gracefully on
 * missing fields.
 *
 * Props:
 *  - order: order object
 *  - onClick: (order) => void, fired on card click
 *  - dateField: 'createdAt' | 'updatedAt' | 'updated_date' | 'created_date' (default 'updatedAt')
 *  - showStatus: whether to render OrderStatusBadge (default true)
 *  - variant: 'default' | 'danger' | 'muted' — border/hover tint (default 'default')
 *  - extraTop: optional ReactNode rendered in header row (under amount, above divider)
 *  - extraBottom: optional ReactNode rendered at the bottom of the card
 */
export default function OrderMobileCard({
  order,
  onClick,
  dateField = 'updatedAt',
  showStatus = true,
  variant = 'default',
  extraTop,
  extraBottom,
}) {
  if (!order) return null;

  const amount = order.amount;
  const currency = order.currency;
  const orderId = order.orderId || order.order_number || order.order_id || order.id;
  const beneficiary = order.beneficiaryName || order.beneficiary_name;
  const bankName = order.bankName || order.bank_name;
  const status = order.status;

  // Date resolution: try the requested field, fall back to common alternatives
  const rawDate = order[dateField] || order.updatedAt || order.updated_date || order.createdAt || order.created_date;

  const formattedDate = rawDate ? safeFormatDate(rawDate) : '-';

  const variantClasses =
    {
      default: 'border-slate-200 hover:border-blue-300',
      danger: 'border-red-200 hover:border-red-400 hover:bg-red-50/40',
      muted: 'border-slate-200 opacity-70 hover:opacity-90',
    }[variant] || 'border-slate-200 hover:border-blue-300';

  return (
    <div
      onClick={() => onClick?.(order)}
      className={`group bg-white border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer ${variantClasses}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-xl sm:text-2xl font-bold text-[#1e3a5f] tabular-nums">
            {amount != null
              ? parseFloat(amount).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '—'}
            {currency && <span className="text-sm sm:text-base font-semibold text-slate-400 ml-1">{currency}</span>}
          </p>
          {orderId && <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{orderId}</p>}
        </div>
        {showStatus && status && (
          <div className="flex-shrink-0">
            <OrderStatusBadge status={status} />
          </div>
        )}
      </div>
      {extraTop}
      <div className="space-y-1.5 border-t border-slate-100 pt-3">
        {beneficiary && (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="font-medium truncate">{beneficiary}</span>
          </div>
        )}
        {bankName && <div className="text-xs text-slate-400 truncate">{bankName}</div>}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">{formattedDate}</span>
        </div>
      </div>
      {extraBottom}
    </div>
  );
}

function safeFormatDate(value) {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return format(d, 'dd MMM yyyy');
  } catch {
    return '-';
  }
}
