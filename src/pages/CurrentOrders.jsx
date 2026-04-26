import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Globe,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
} from 'lucide-react';
import ClientPageHeader from '@/components/user/ClientPageHeader';
import { t } from '@/components/utils/language';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import ClientTermsDrawer from '@/components/client/ClientTermsDrawer';
import { format } from 'date-fns';

const ACTIVE_STATUSES = ['created', 'check', 'pending_payment', 'on_execution'];

const STATUS_CONFIG = {
  created: {
    labelKey: 'created',
    icon: Clock,
    color: 'bg-blue-500',
    light: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    descKey: 'statusCreatedDesc',
  },
  check: {
    labelKey: 'statusUnderReviewLabel',
    icon: AlertCircle,
    color: 'bg-amber-500',
    light: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    descKey: 'statusUnderReviewDesc',
  },
  pending_payment: {
    labelKey: 'pending_payment',
    icon: CreditCard,
    color: 'bg-orange-500',
    light: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    descKey: 'statusPendingPaymentDesc',
  },
  on_execution: {
    labelKey: 'statusInProgressLabel',
    icon: Loader2,
    color: 'bg-indigo-500',
    light: 'bg-indigo-50 border-indigo-200',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    descKey: 'statusInProgressDesc',
  },
};

function OrderCard({ order, onOpen }) {
  return (
    <div
      onClick={() => onOpen(order)}
      className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-2xl font-bold text-[#1e3a5f] tabular-nums">
            {parseFloat(order.amount || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className="text-base font-semibold text-slate-400 ml-1">{order.currency}</span>
          </p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{order.orderId}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="space-y-1.5 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-medium truncate">{order.beneficiaryName}</span>
        </div>
        {order.bankName && <div className="text-xs text-slate-400 truncate">{order.bankName}</div>}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">
            {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order, onOpen }) {
  return (
    <tr
      onClick={() => onOpen(order)}
      className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 cursor-pointer transition-colors"
    >
      <td className="py-3 pl-5 pr-3">
        <span className="text-xs font-mono text-slate-500">{order.orderId}</span>
      </td>
      <td className="py-3 px-3">
        <span className="text-xs text-slate-500">
          {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '-'}
        </span>
      </td>
      <td className="py-3 px-3">
        <span className="font-bold text-[#1e3a5f] tabular-nums text-sm">
          {parseFloat(order.amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <span className="text-slate-400 font-normal ml-1 text-xs">{order.currency}</span>
        </span>
      </td>
      <td className="py-3 px-3">
        <span className="text-sm text-slate-700 truncate max-w-[180px] block">{order.beneficiaryName}</span>
      </td>
      <td className="py-3 px-3">
        <span className="text-xs text-slate-400 truncate max-w-[140px] block">{order.bankName || '-'}</span>
      </td>
      <td className="py-3 pl-3 pr-5" />
    </tr>
  );
}

export default function CurrentOrders() {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [collapsedSections, setCollapsedSections] = useState({});

  const { data: myClient } = useQuery({
    queryKey: ['my-client'],
    queryFn: () => apiClient.getMyClient(),
  });

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['current-orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const currentOrders = useMemo(() => {
    return orders.filter((o) => {
      if (myClient && o.clientId !== myClient.client_id) return false;
      return (
        o.status !== 'cancelled' &&
        o.status !== 'client_canceled' &&
        !o.executed &&
        !o.deleted &&
        o.status !== 'released'
      );
    });
  }, [orders, myClient]);

  const filteredOrders = useMemo(() => {
    return currentOrders
      .filter((order) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return order.orderId?.toLowerCase().includes(s) || order.beneficiaryName?.toLowerCase().includes(s);
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [currentOrders, search, sortOrder]);

  const groupedOrders = useMemo(() => {
    return ACTIVE_STATUSES.reduce((acc, status) => {
      acc[status] = filteredOrders.filter((o) => o.status === status);
      return acc;
    }, {});
  }, [filteredOrders]);

  const stats = useMemo(() => {
    return ACTIVE_STATUSES.reduce((acc, status) => {
      const group = currentOrders.filter((o) => o.status === status);
      acc[status] = {
        count: group.length,
        totalUSD: group.filter((o) => o.currency === 'USD').reduce((s, o) => s + (parseFloat(o.amount) || 0), 0),
        totalEUR: group.filter((o) => o.currency === 'EUR').reduce((s, o) => s + (parseFloat(o.amount) || 0), 0),
        totalCNY: group.filter((o) => o.currency === 'CNY').reduce((s, o) => s + (parseFloat(o.amount) || 0), 0),
      };
      return acc;
    }, {});
  }, [currentOrders]);

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const toggleSection = (status) => {
    setCollapsedSections((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <ClientPageHeader
        sticky
        subtitle={t('trackTransferStatus')}
        badgeLabel={`${currentOrders.length} ${t('activeLabel')}`}
        actions={
          <Link to={createPageUrl('GTrans')}>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <Globe className="w-4 h-4 mr-1" /> {t('publicSite')}
            </Button>
          </Link>
        }
      />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Summary Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {ACTIVE_STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const s = stats[status];
            const Icon = cfg.icon;
            return (
              <div key={status} className={`rounded-2xl border-2 ${cfg.light} p-4 shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${cfg.text}`} />
                  <span className={`text-xs font-semibold ${cfg.text}`}>{t(cfg.labelKey)}</span>
                </div>
                <div className={`text-3xl font-bold ${cfg.text}`}>{s.count}</div>
                <div className="mt-1 space-y-0.5">
                  {s.totalUSD > 0 && <div className="text-xs text-slate-500">USD {s.totalUSD.toLocaleString()}</div>}
                  {s.totalEUR > 0 && <div className="text-xs text-slate-500">EUR {s.totalEUR.toLocaleString()}</div>}
                  {s.totalCNY > 0 && <div className="text-xs text-slate-500">CNY {s.totalCNY.toLocaleString()}</div>}
                  {s.count === 0 && <div className="text-xs text-slate-400 italic">{t('noneLabel')}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t('searchOrdersBeneficiary')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-slate-200 rounded-xl h-10"
            />
          </div>
          <button
            onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 bg-white px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> {sortOrder === 'desc' ? t('newestFirst') : t('oldestFirst')}
          </button>
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4 mr-1" /> {t('clearFilters')}
            </Button>
          )}
        </div>

        {/* Segmented Sections */}
        {isLoading ? (
          <div className="text-center text-slate-400 py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            {t('loadingYourOrders')}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-slate-400 py-20 bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="font-medium text-slate-500">{t('noActiveOrders')}</p>
            {search && <p className="text-sm mt-1">{t('tryClearingSearch')}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {ACTIVE_STATUSES.map((status) => {
              const group = groupedOrders[status];
              const cfg = STATUS_CONFIG[status];
              const isCollapsed = collapsedSections[status];
              const Icon = cfg.icon;
              if (group.length === 0) return null;

              return (
                <div key={status} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Section Header */}
                  <button
                    className={`w-full flex items-center justify-between px-5 py-3.5 ${cfg.light} border-b hover:opacity-95 transition-opacity`}
                    onClick={() => toggleSection(status)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                      <span className={`font-semibold text-sm ${cfg.text}`}>{t(cfg.labelKey)}</span>
                      <Badge className={`${cfg.color} text-white text-xs px-2`}>{group.length}</Badge>
                      <span className={`text-xs hidden sm:block ${cfg.text} opacity-70`}>{t(cfg.descKey)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex gap-3 text-xs text-slate-500">
                        {['USD', 'EUR', 'CNY'].map((cur) => {
                          const total = group
                            .filter((o) => o.currency === cur)
                            .reduce((s, o) => s + (parseFloat(o.amount) || 0), 0);
                          return total > 0 ? (
                            <span key={cur} className="font-medium">
                              {cur} {total.toLocaleString()}
                            </span>
                          ) : null;
                        })}
                      </div>
                      {isCollapsed ? (
                        <ChevronDown className={`w-4 h-4 ${cfg.text}`} />
                      ) : (
                        <ChevronUp className={`w-4 h-4 ${cfg.text}`} />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50/60 border-b border-slate-100">
                              <th className="text-left text-xs font-semibold text-slate-400 py-2.5 pl-5 pr-3">
                                {t('orderId')}
                              </th>
                              <th className="text-left text-xs font-semibold text-slate-400 py-2.5 px-3">
                                {t('date')}
                              </th>
                              <th className="text-left text-xs font-semibold text-slate-400 py-2.5 px-3">
                                {t('amountLabel')}
                              </th>
                              <th className="text-left text-xs font-semibold text-slate-400 py-2.5 px-3">
                                {t('beneficiaryLabel')}
                              </th>
                              <th className="text-left text-xs font-semibold text-slate-400 py-2.5 px-3">
                                {t('bankLabel')}
                              </th>
                              <th className="py-2.5 pl-3 pr-5" />
                            </tr>
                          </thead>
                          <tbody>
                            {group.map((order) => (
                              <OrderRow key={order.orderId} order={order} onOpen={openDrawer} />
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden p-4 grid grid-cols-1 gap-3">
                        {group.map((order) => (
                          <OrderCard key={order.orderId} order={order} onOpen={openDrawer} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ClientTermsDrawer
        order={selectedOrder}
        client={myClient}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={refetch}
      />
    </div>
  );
}
