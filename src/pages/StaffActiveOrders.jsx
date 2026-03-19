import React, { useState, useMemo, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown, ChevronUp, ArrowLeft, Search, FileDown, CheckCircle, Trash2, AlertTriangle, X, ArrowUpDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { isAboveThreshold } from '@/components/orders/thresholdUtils';
import { computeClientAverage } from '@/components/orders/SuspiciousTransactionAlert';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import StaffOrderDrawer from '@/components/staff/StaffOrderDrawer';
import { t } from '@/components/utils/language';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

const ACTIVE_STATUSES = ['created', 'draft', 'check', 'pending_payment', 'on_execution'];
const ALL_STATUSES = ['created', 'draft', 'check', 'rejected', 'pending_payment', 'on_execution', 'released', 'cancelled'];

const STATUS_CONFIG = {
  created:         { label: 'Created',         color: 'bg-blue-500',   light: 'bg-blue-50 border-blue-200',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  draft:           { label: 'Draft',           color: 'bg-slate-500',  light: 'bg-slate-50 border-slate-200',  text: 'text-slate-700',  dot: 'bg-slate-400' },
  check:           { label: 'Check',           color: 'bg-amber-500',  light: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  pending_payment: { label: 'Pending Payment', color: 'bg-orange-500', light: 'bg-orange-50 border-orange-200',text: 'text-orange-700', dot: 'bg-orange-500' },
  on_execution:    { label: 'On Execution',    color: 'bg-indigo-500', light: 'bg-indigo-50 border-indigo-200',text: 'text-indigo-700', dot: 'bg-indigo-500' },
};

function AlertIcon({ reasons }) {
  if (reasons.length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button onClick={e => e.stopPropagation()} className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors flex-shrink-0">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 text-xs shadow-lg border-amber-200" side="right">
        <div className="font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> {t('riskAlert')}
        </div>
        <ul className="space-y-1.5">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5 text-slate-700">
              <span className="text-amber-500 mt-0.5">•</span> {r}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function getAlertReasons(order, isSuspicious, avg) {
  const reasons = [];
  if (isAboveThreshold(order.amount, order.currency)) reasons.push(`Amount ≥ 25,000 USD equivalent — regulatory reporting threshold`);
  if (isSuspicious && avg) reasons.push(`Amount is ${(parseFloat(order.amount) / avg).toFixed(1)}x above this client's historical average (avg: ${order.currency} ${avg.toLocaleString('en-US', { maximumFractionDigits: 0 })})`);
  return reasons;
}

function OrderRow({ order, selectedIds, onSelect, onOpen, isSuspicious, avg, clientName }) {
  const isThreshold = isAboveThreshold(order.amount, order.currency);
  const hasAlert = isThreshold || isSuspicious;
  const reasons = getAlertReasons(order, isSuspicious, avg);
  return (
    <TableRow className={`border-slate-200 hover:bg-blue-50/50 cursor-pointer transition-colors ${hasAlert ? 'bg-amber-50/30' : ''}`}>
      <TableCell className="w-10 py-2 pl-4" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selectedIds.has(order.orderId)} onCheckedChange={(checked) => onSelect(order.orderId, checked)} />
      </TableCell>
      <TableCell className="w-36 text-[#1e3a5f] font-mono text-xs py-2 cursor-pointer" onClick={() => onOpen(order)}>
        <div className="flex items-center gap-1">
          {order.orderId}
          {order.invocieRequired && <AlertTriangle className="w-3 h-3 text-[#f5a623]" />}
        </div>
      </TableCell>
      <TableCell className="min-w-[160px] text-slate-700 py-2 cursor-pointer" onClick={() => onOpen(order)}>
        <div className="text-xs font-medium">{clientName || '-'}</div>
        <div className="text-xs text-slate-400 font-mono">{order.clientId}</div>
      </TableCell>
      <TableCell className="w-44 py-2 cursor-pointer" onClick={() => onOpen(order)}>
        <div className="flex items-center gap-1.5">
          <span className={`font-medium text-xs ${hasAlert ? 'text-amber-700' : 'text-[#1e3a5f]'}`}>
            {parseFloat(order.amount || 0).toLocaleString()} {order.currency}
          </span>
        </div>
      </TableCell>
      <TableCell className="w-10 py-2">
        <AlertIcon reasons={reasons} />
      </TableCell>
      <TableCell className="w-20 py-2 text-center cursor-pointer" onClick={() => onOpen(order)}>
        <Badge className={`text-xs ${order.invocieReceived ? 'bg-emerald-600' : 'bg-slate-300 text-slate-600'}`}>{order.invocieReceived ? 'Y' : 'N'}</Badge>
      </TableCell>
      <TableCell className="w-20 py-2 text-center cursor-pointer" onClick={() => onOpen(order)}>
        <Badge className={`text-xs ${order.paymentProof ? 'bg-emerald-600' : 'bg-slate-300 text-slate-600'}`}>{order.paymentProof ? 'Y' : 'N'}</Badge>
      </TableCell>
      <TableCell className="w-20 py-2 text-center cursor-pointer" onClick={() => onOpen(order)}>
        <Badge className={`text-xs ${order.nonMandiriExecution ? 'bg-orange-500' : 'bg-slate-300 text-slate-600'}`}>{order.nonMandiriExecution ? 'Y' : 'N'}</Badge>
      </TableCell>
      <TableCell className="min-w-[100px] text-slate-600 text-xs font-mono py-2 cursor-pointer" onClick={() => onOpen(order)}>
        {order.invoiceNumber || '-'}
      </TableCell>
    </TableRow>
  );
}

export default function StaffActiveOrders() {
  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [suspiciousAlertOrder, setSuspiciousAlertOrder] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [groupByClient, setGroupByClient] = useState(false);

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['staff-active-orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.user_id] = u.username; });
    return map;
  }, [users]);

  // Состояние для хранения данных клиентов
  const [clientsMap, setClientsMap] = useState({});

  const activeOrders = useMemo(() => {
    return orders.filter(o => ACTIVE_STATUSES.includes(o.status) && !o.deleted && !o.executed);
  }, [orders]);

  // Получить уникальные client_id из заказов
  const uniqueClientIds = useMemo(() => {
    return [...new Set(activeOrders.map(o => o.clientId).filter(Boolean))];
  }, [activeOrders]);

  // Загрузить данные клиентов при изменении списка
  useEffect(() => {
    const loadClients = async () => {
      const promises = uniqueClientIds.map(async (clientId) => {
        try {
          const clientData = await apiClient.getClientById(clientId);
          return {
            id: clientId,
            data: {
              name: clientData.client_name || clientId,
              clientId: clientId,
              country: clientData.client_reg_country || '',
              email: clientData.client_mail || '',
              status: clientData.status_sign || ''
            }
          };
        } catch (error) {
          console.error(`Failed to load client ${clientId}:`, error);
          return {
            id: clientId,
            data: { name: clientId, clientId: clientId, country: '', email: '', status: '' }
          };
        }
      });

      const results = await Promise.all(promises);
      const newClientsMap = {};
      results.forEach(res => { newClientsMap[res.id] = res.data; });
      setClientsMap(newClientsMap);
    };

    if (uniqueClientIds.length > 0) {
      loadClients();
    }
  }, [uniqueClientIds]);

  const suspiciousOrderIds = useMemo(() => {
    const ids = new Set();
    activeOrders.forEach(order => {
      const avg = computeClientAverage(orders, order.clientId, order.orderId);
      if (avg !== null && parseFloat(order.amount) / avg >= 3) ids.add(order.orderId);
    });
    return ids;
  }, [activeOrders, orders]);

  const filteredOrders = useMemo(() => {
    return activeOrders.filter(order => {
      if (currencyFilter !== 'all' && order.currency !== currencyFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return order.orderId?.toLowerCase().includes(s) ||
               (clientsMap[order.clientId]?.name || '').toLowerCase().includes(s) ||
               order.clientId?.toLowerCase().includes(s) ||
               order.beneficiaryName?.toLowerCase().includes(s) ||
               order.bankBic?.toLowerCase().includes(s);
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [activeOrders, currencyFilter, search, sortOrder, clientsMap]);

  const groupedOrders = useMemo(() => {
    return ACTIVE_STATUSES.reduce((acc, status) => {
      acc[status] = filteredOrders.filter(o => o.status === status);
      return acc;
    }, {});
  }, [filteredOrders]);

  const clientGroups = useMemo(() => {
    const map = {};
    filteredOrders.forEach(o => {
      const key = o.clientId || 'unknown';
      if (!map[key]) map[key] = { client_id: o.clientId, client_name: clientsMap[o.clientId]?.name || o.clientId, orders: [] };
      map[key].orders.push(o);
    });
    return Object.values(map).sort((a, b) => b.orders.length - a.orders.length);
  }, [filteredOrders, clientsMap]);

  const stats = useMemo(() => {
    return ACTIVE_STATUSES.reduce((acc, status) => {
      const group = activeOrders.filter(o => o.status === status);
      acc[status] = {
        count: group.length,
        totalUSD: group.filter(o => o.currency === 'USD').reduce((s, o) => s + (parseFloat(o.amount) || 0), 0),
        totalEUR: group.filter(o => o.currency === 'EUR').reduce((s, o) => s + (parseFloat(o.amount) || 0), 0),
        totalCNY: group.filter(o => o.currency === 'CNY').reduce((s, o) => s + (parseFloat(o.amount) || 0), 0),
      };
      return acc;
    }, {});
  }, [activeOrders]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.updateOrder(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-active-orders'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (ids) => Promise.all(ids.map(id => apiClient.deleteOrder(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-active-orders'] });
      toast.success('Orders deleted');
      setSelectedIds(new Set());
      setDeleteDialogOpen(false);
    },
  });

  const handleSelectAll = (checked) => {
    if (checked) setSelectedIds(new Set(filteredOrders.map(o => o.orderId)));
    else setSelectedIds(new Set());
  };

  const handleSelectOne = (id, checked) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id); else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleStatusChange = (order, newStatus) => {
    updateMutation.mutate({ id: order.orderId, data: { status: newStatus } });
    toast.success(`Status changed to ${newStatus}`);
  };

  const handleCreateInstruction = async () => {
    const selectedOrderIds = Array.from(selectedIds);
    if (selectedOrderIds.length === 0) {
      toast.error('No orders selected');
      return;
    }

    try {
      const blob = await apiClient.exportTxtInstructions(selectedOrderIds);
      const filename = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_instruction.txt`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Instruction file created for ${selectedOrderIds.length} orders`);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['staff-active-orders'] });
    } catch (error) {
      toast.error('Failed to create instruction file: ' + (error.message || 'Unknown error'));
    }
  };

  const handleMarkAsExecuted = () => {
    const selectedOrders = filteredOrders.filter(o => selectedIds.has(o.orderId));
    if (selectedOrders.length === 0) { toast.error('No orders selected'); return; }
    selectedOrders.forEach(order => {
      updateMutation.mutate({ id: order.orderId, data: { status: 'released', executed: true } });
    });
    toast.success(`${selectedOrders.length} orders marked as executed`);
    setSelectedIds(new Set());
  };

  const openDrawer = (order) => {
    const avg = computeClientAverage(orders, order.clientId, order.orderId);
    if (avg !== null && parseFloat(order.amount) / avg >= 3) {
      setSuspiciousAlertOrder({ order, avg, ratio: parseFloat(order.amount) / avg });
    } else {
      setSelectedOrder(order);
      setDrawerOpen(true);
    }
  };

  const handleDrawerSave = async (data) => {
    await apiClient.updateOrder(selectedOrder.orderId, data);
    toast.success('Order updated');
    setDrawerOpen(false);
    queryClient.invalidateQueries({ queryKey: ['staff-active-orders'] });
  };

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderOrderTable = (ordersList, showClientColumn = true) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-slate-100">
            <TableHead className="w-10 pl-4" />
            <TableHead className="w-36 text-slate-500 font-semibold text-xs">{t('orderId')}</TableHead>
            {showClientColumn && <TableHead className="min-w-[160px] text-slate-500 font-semibold text-xs">{t('clientLabel')}</TableHead>}
            <TableHead className="w-44 text-slate-500 font-semibold text-xs">{t('amountLabel')}</TableHead>
            <TableHead className="w-10" />
            <TableHead className="w-20 text-center text-slate-500 font-semibold text-xs">{t('invRcv')}</TableHead>
            <TableHead className="w-20 text-center text-slate-500 font-semibold text-xs">{t('proof')}</TableHead>
            <TableHead className="w-20 text-center text-slate-500 font-semibold text-xs">{t('nonM')}</TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs pr-4">{t('invNum')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersList.map(order => (
            <OrderRow
              key={order.orderId}
              order={order}
              selectedIds={selectedIds}
              onSelect={handleSelectOne}
              onOpen={openDrawer}
              isSuspicious={suspiciousOrderIds.has(order.orderId)}
              avg={computeClientAverage(orders, order.clientId, order.orderId)}
              clientName={clientsMap[order.clientId]?.name}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - kept from our version */}
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('StaffDashboard')}>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
                <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">GTrans Staff</h1>
                  <span className="text-white/60">•</span>
                  <span className="text-white">{t('mod_activeOrders_title')}</span>
                </div>
                <Badge className="bg-[#f5a623] text-white">{activeOrders.length} {t('ordersLabel')}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link to={createPageUrl('GTrans')}>
                <Button variant="outline" size="sm" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-1" /> {t('publicSite')}
                </Button>
              </Link>
              {selectedIds.size > 0 && (
                <>
                  <span className="text-white/70 text-sm">{selectedIds.size} {t('selectedLabel')}</span>
                  <Button onClick={handleCreateInstruction} className="bg-white/10 hover:bg-white/20 text-white border border-white/30">
                    <FileDown className="w-4 h-4 mr-2" /> {t('createTxt')}
                  </Button>
                  <Button onClick={handleMarkAsExecuted} className="bg-[#f5a623] hover:bg-[#e09000] text-white">
                    <CheckCircle className="w-4 h-4 mr-2" /> {t('markExecuted')}
                  </Button>
                  <Button onClick={() => setDeleteDialogOpen(true)} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> {t('deleteLabel')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {ACTIVE_STATUSES.map(status => {
            const cfg = STATUS_CONFIG[status];
            const s = stats[status];
            return (
              <div key={status} className={`rounded-xl border-2 ${cfg.light} p-4 shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
                </div>
                <div className={`text-3xl font-bold ${cfg.text}`}>{s.count}</div>
                <div className="mt-2 space-y-0.5">
                  {s.totalUSD > 0 && <div className="text-xs text-slate-500">USD {s.totalUSD.toLocaleString()}</div>}
                  {s.totalEUR > 0 && <div className="text-xs text-slate-500">EUR {s.totalEUR.toLocaleString()}</div>}
                  {s.totalCNY > 0 && <div className="text-xs text-slate-500">CNY {s.totalCNY.toLocaleString()}</div>}
                  {s.totalUSD === 0 && s.totalEUR === 0 && s.totalCNY === 0 && (
                    <div className="text-xs text-slate-400 italic">{t('noOrdersLabel')}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input placeholder={t('searchActiveOrdersPlaceholder')}
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400" />
          </div>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-36 bg-white border-slate-300 text-slate-800">
              <SelectValue placeholder={t('selectCurrency')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCurrencies')}</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="CNY">CNY</SelectItem>
              <SelectItem value="IDR">IDR</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-300 bg-white px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">
            <ArrowUpDown className="w-3 h-3" /> {sortOrder === 'desc' ? t('newestFirst') : t('oldestFirst')}
          </button>
          <button
            onClick={() => setSelectedIds(new Set(filteredOrders.filter(o => o.status === 'on_execution').map(o => o.orderId)))}
            className="text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-2 rounded-md hover:bg-indigo-100 transition-colors font-medium"
          >
            {t('selectOnExecution')}
          </button>
          {/* Group by toggle */}
          <div className="ml-auto flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setGroupByClient(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!groupByClient ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('byStatus')}
            </button>
            <button
              onClick={() => setGroupByClient(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${groupByClient ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('byClient')}
            </button>
          </div>
          {(currencyFilter !== 'all' || search) && (
            <Button variant="ghost" size="sm" onClick={() => { setCurrencyFilter('all'); setSearch(''); }} className="text-slate-500 hover:text-slate-800">
              <X className="w-4 h-4 mr-1" /> {t('clearFilters')}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center text-slate-500 py-16">{t('loadingDots')}</div>
        ) : (
          <div className="space-y-4">
            {groupByClient ? (
              /* ── BY CLIENT VIEW ── */
              clientGroups.length === 0 ? (
                <div className="text-center text-slate-400 py-16 bg-white rounded-xl border border-slate-200">{t('noActiveOrders')}</div>
              ) : (
                clientGroups.map(({ client_id, client_name, orders: clientOrders }) => {
                  const isCollapsed = collapsedSections[`client_${client_id}`];
                  const totalByCur = ['USD','EUR','CNY'].map(cur => {
                    const t = clientOrders.filter(o => o.currency === cur).reduce((s,o) => s+(parseFloat(o.amount)||0),0);
                    return t > 0 ? `${cur} ${t.toLocaleString()}` : null;
                  }).filter(Boolean);
                  const hasAlert = clientOrders.some(o => suspiciousOrderIds.has(o.orderId) || isAboveThreshold(o.amount, o.currency));
                  const statusesPresent = ACTIVE_STATUSES.filter(s => clientOrders.some(o => o.status === s));
                  return (
                    <div key={client_id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${hasAlert ? 'border-amber-300' : 'border-slate-200'}`}>
                      {/* Client header */}
                      <button
                        className={`w-full flex items-center justify-between px-5 py-3.5 hover:opacity-90 transition-opacity ${hasAlert ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}
                        onClick={() => toggleSection(`client_${client_id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm ${hasAlert ? 'bg-amber-500' : 'bg-[#1e3a5f]'}`}>
                            {(client_name || client_id || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                              {client_name || client_id}
                              {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">{client_id}</div>
                          </div>
                          <Badge className={`text-xs ${hasAlert ? 'bg-amber-500' : 'bg-[#1e3a5f]'} text-white`}>{clientOrders.length} {t('clientOrdersBadge')}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2 text-xs text-slate-500">{totalByCur.map(t => <span key={t} className="bg-white border border-slate-200 rounded px-2 py-0.5">{t}</span>)}</div>
                          <div className="flex gap-1.5 flex-wrap">
                            {statusesPresent.map(s => {
                              const c = STATUS_CONFIG[s];
                              const cnt = clientOrders.filter(o => o.status === s).length;
                              return <span key={s} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.color} text-white`}>{c.label} {cnt}</span>;
                            })}
                          </div>
                          {isCollapsed ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {/* Status sub-sections */}
                      {!isCollapsed && (
                        <div className="divide-y divide-slate-100">
                          {statusesPresent.map(status => {
                            const cfg = STATUS_CONFIG[status];
                            const statusOrders = clientOrders.filter(o => o.status === status);
                            return (
                              <div key={status}>
                                <div className={`flex items-center gap-2 px-5 py-2 ${cfg.light}`}>
                                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                  <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                                  <span className={`text-xs ${cfg.text} opacity-70`}>({statusOrders.length})</span>
                                </div>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                                        <TableHead className="w-10 pl-4" />
                                        <TableHead className="w-36 text-slate-500 font-semibold text-xs">{t('orderId')}</TableHead>
                                        <TableHead className="w-44 text-slate-500 font-semibold text-xs">{t('amountLabel')}</TableHead>
                                        <TableHead className="w-10" />
                                        <TableHead className="w-20 text-center text-slate-500 font-semibold text-xs">{t('invRcv')}</TableHead>
                                        <TableHead className="w-20 text-center text-slate-500 font-semibold text-xs">{t('proof')}</TableHead>
                                        <TableHead className="w-20 text-center text-slate-500 font-semibold text-xs">{t('nonM')}</TableHead>
                                        <TableHead className="text-slate-500 font-semibold text-xs pr-4">{t('invNum')}</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {statusOrders.map(order => (
                                        <TableRow key={order.orderId} className={`border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${(isAboveThreshold(order.amount, order.currency) || suspiciousOrderIds.has(order.orderId)) ? 'bg-amber-50/30' : ''}`} onClick={() => openDrawer(order)}>
                                          <TableCell className="w-10 py-2 pl-4" onClick={e => e.stopPropagation()}>
                                            <Checkbox checked={selectedIds.has(order.orderId)} onCheckedChange={(c) => handleSelectOne(order.orderId, c)} />
                                          </TableCell>
                                          <TableCell className="w-36 font-mono text-xs text-[#1e3a5f] py-2">
                                            <div className="flex items-center gap-1">{order.orderId}{order.invocieRequired && <AlertTriangle className="w-3 h-3 text-[#f5a623]" />}</div>
                                          </TableCell>
                                          <TableCell className="w-44 py-2">
                                            <span className={`font-medium text-xs ${(isAboveThreshold(order.amount, order.currency) || suspiciousOrderIds.has(order.orderId)) ? 'text-amber-700' : 'text-[#1e3a5f]'}`}>
                                              {parseFloat(order.amount || 0).toLocaleString()} {order.currency}
                                            </span>
                                          </TableCell>
                                          <TableCell className="w-10 py-2">
                                            <AlertIcon reasons={getAlertReasons(order, suspiciousOrderIds.has(order.orderId), computeClientAverage(orders, order.clientId, order.orderId))} />
                                          </TableCell>
                                          <TableCell className="w-20 text-center py-2"><Badge className={`text-xs ${order.invocieReceived ? 'bg-emerald-600' : 'bg-slate-300 text-slate-600'}`}>{order.invocieReceived ? 'Y' : 'N'}</Badge></TableCell>
                                          <TableCell className="w-20 text-center py-2"><Badge className={`text-xs ${order.paymentProof ? 'bg-emerald-600' : 'bg-slate-300 text-slate-600'}`}>{order.paymentProof ? 'Y' : 'N'}</Badge></TableCell>
                                          <TableCell className="w-20 text-center py-2"><Badge className={`text-xs ${order.nonMandiriExecution ? 'bg-orange-500' : 'bg-slate-300 text-slate-600'}`}>{order.nonMandiriExecution ? 'Y' : 'N'}</Badge></TableCell>
                                          <TableCell className="text-slate-600 text-xs font-mono py-2 pr-4">{order.invoiceNumber || '-'}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            ) : (
              /* ── BY STATUS VIEW ── */
              <>
                {ACTIVE_STATUSES.map(status => {
                  const group = groupedOrders[status];
                  const cfg = STATUS_CONFIG[status];
                  const isCollapsed = collapsedSections[status];
                  if (group.length === 0) return null;
                  return (
                    <div key={status} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <button
                        className={`w-full flex items-center justify-between px-5 py-3 border-b ${cfg.light} hover:opacity-90 transition-opacity`}
                        onClick={() => toggleSection(status)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                          <span className={`font-semibold text-sm ${cfg.text}`}>{cfg.label}</span>
                          <Badge className={`${cfg.color} text-white text-xs`}>{group.length}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-3 text-xs text-slate-500">
                            {['USD', 'EUR', 'CNY'].map(cur => {
                              const total = group.filter(o => o.currency === cur).reduce((s, o) => s + (parseFloat(o.amount) || 0), 0);
                              return total > 0 ? <span key={cur}>{cur} {total.toLocaleString()}</span> : null;
                            })}
                          </div>
                          {isCollapsed ? <ChevronDown className={`w-4 h-4 ${cfg.text}`} /> : <ChevronUp className={`w-4 h-4 ${cfg.text}`} />}
                        </div>
                      </button>
                      {!isCollapsed && renderOrderTable(group)}
                    </div>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <div className="text-center text-slate-400 py-16 bg-white rounded-xl border border-slate-200">
                    {t('noActiveOrders')}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <StaffOrderDrawer order={selectedOrder} open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleDrawerSave} />

      {/* Suspicious Transaction Alert Dialog */}
      <AlertDialog open={!!suspiciousAlertOrder} onOpenChange={(open) => { if (!open) setSuspiciousAlertOrder(null); }}>
        <AlertDialogContent className="bg-white border-orange-300 border-2 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5 text-orange-600" /> {t('unusualTransactionTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700">
                  <strong>{clientsMap[suspiciousAlertOrder?.order?.clientId]?.name || suspiciousAlertOrder?.order?.clientId}</strong> {t('unusualTransactionDesc')}
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{t('thisOrder')}</span>
                    <span className="font-bold text-orange-700">{suspiciousAlertOrder?.order?.currency} {parseFloat(suspiciousAlertOrder?.order?.amount || 0).toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{t('clientAvgLabel')}</span>
                    <span className="font-semibold text-slate-700">{suspiciousAlertOrder?.order?.currency} {suspiciousAlertOrder?.avg?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-orange-200 pt-1 mt-1">
                    <span className="text-slate-600">{t('deviationLabel')}</span>
                    <span className="font-bold text-red-600">{suspiciousAlertOrder?.ratio?.toFixed(1)}{t('xAboveAverage')}</span>
                  </div>
                </div>
                <p className="text-orange-600 text-xs font-medium italic">{t('enhancedVerification')}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSuspiciousAlertOrder(null)} className="border-slate-300">{t('cancelLabel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setSelectedOrder(suspiciousAlertOrder.order); setDrawerOpen(true); setSuspiciousAlertOrder(null); }} className="bg-orange-600 hover:bg-orange-700 text-white">
              {t('proceedToReview')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteLabel')} {selectedIds.size} {t('deleteOrdersTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">{t('deleteOrdersDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">{t('cancelLabel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate([...selectedIds])} className="bg-red-600 hover:bg-red-700">{t('deleteLabel')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
