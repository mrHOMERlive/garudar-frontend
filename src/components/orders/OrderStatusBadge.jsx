import React from 'react';
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  created: { label: 'Created', color: 'bg-blue-500 text-white border-blue-600' },
  draft: { label: 'Draft', color: 'bg-slate-400 text-white border-slate-500' },
  check: { label: 'Check', color: 'bg-amber-500 text-white border-amber-600' },
  pending_payment: { label: 'Pending Payment', color: 'bg-orange-500 text-white border-orange-600' },
  rejected: { label: 'Rejected', color: 'bg-red-600 text-white border-red-700' },
  cancelled: { label: 'Canceled', color: 'bg-orange-500 text-white border-orange-600' },
  client_canceled: { label: 'Client Canceled', color: 'bg-orange-500 text-white border-orange-600' },
  on_execution: { label: 'On Execution', color: 'bg-cyan-700 text-white border-cyan-800' },
  released: { label: 'Released', color: 'bg-emerald-600 text-white border-emerald-700' }
};

export default function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-800' };

  return (
    <Badge className={`${config.color} font-semibold px-3 py-1 shadow-sm border`}>
      {config.label}
    </Badge>
  );
}

export { STATUS_CONFIG };