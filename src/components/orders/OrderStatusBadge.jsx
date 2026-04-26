import React from 'react';
import { Badge } from '@/components/ui/badge';
import { t } from '@/components/utils/language';

const STATUS_COLORS = {
  created: 'bg-blue-500 text-white border-blue-600',
  draft: 'bg-slate-400 text-white border-slate-500',
  check: 'bg-amber-500 text-white border-amber-600',
  pending_payment: 'bg-orange-500 text-white border-orange-600',
  rejected: 'bg-red-600 text-white border-red-700',
  cancelled: 'bg-orange-500 text-white border-orange-600',
  client_canceled: 'bg-orange-500 text-white border-orange-600',
  on_execution: 'bg-cyan-700 text-white border-cyan-800',
  released: 'bg-emerald-600 text-white border-emerald-700',
};

function getStatusLabel(status) {
  switch (status) {
    case 'created':
      return t('created');
    case 'draft':
      return t('draft');
    case 'check':
      return t('check');
    case 'pending_payment':
      return t('pending_payment');
    case 'rejected':
      return t('rejected');
    case 'cancelled':
      return t('statusCanceledLabel');
    case 'client_canceled':
      return t('statusClientCanceledLabel');
    case 'on_execution':
      return t('on_execution');
    case 'released':
      return t('released');
    default:
      return status;
  }
}

// Provide STATUS_CONFIG with dynamic label getter for backwards compatibility
const STATUS_CONFIG = new Proxy(STATUS_COLORS, {
  get(target, prop) {
    if (prop in target) {
      return {
        label: getStatusLabel(prop),
        color: target[prop],
      };
    }
    return undefined;
  },
});

export default function OrderStatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'bg-slate-100 text-slate-800';
  const label = getStatusLabel(status);

  return <Badge className={`${color} font-semibold px-3 py-1 shadow-sm border`}>{label}</Badge>;
}

export { STATUS_CONFIG };
