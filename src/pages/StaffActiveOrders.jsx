import React, { useState, useMemo, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Search, FileDown, CheckCircle, Trash2, AlertTriangle, X, Pencil, FileText, Download } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import StaffOrderDrawer from '@/components/staff/StaffOrderDrawer';
import { downloadWordTemplate } from '@/components/staff/utils/wordTemplateGenerator';
import { parseStatusHistory, addStatusEntry } from '@/components/utils/statusHistoryHelper';
import moment from 'moment';

const ACTIVE_STATUSES = ['created', 'draft', 'check', 'pending_payment', 'on_execution'];
const ALL_STATUSES = ['created', 'draft', 'check', 'rejected', 'pending_payment', 'on_execution', 'released', 'cancelled'];

export default function StaffActiveOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    users.forEach(u => { map[u.id] = u.username; });
    return map;
  }, [users]);

  // Состояние для хранения данных клиентов
  const [clientsMap, setClientsMap] = useState({});

  // Получить уникальные client_id из заказов
  const uniqueClientIds = useMemo(() => {
    return [...new Set(orders.map(o => o.clientId).filter(Boolean))];
  }, [orders]);

  // Загрузить данные клиентов при изменении списка
  useEffect(() => {
    const loadClients = async () => {
      const newClientsMap = {};
      
      for (const clientId of uniqueClientIds) {
        try {
          const clientData = await apiClient.getClientById(clientId);
          newClientsMap[clientId] = {
            name: clientData.client_name || clientId,
            clientId: clientId,
            country: clientData.client_reg_country || '',
            email: clientData.client_mail || '',
            status: clientData.status_sign || ''
          };
        } catch (error) {
          console.error(`Failed to load client ${clientId}:`, error);
          newClientsMap[clientId] = {
            name: clientId,
            clientId: clientId,
            country: '',
            email: '',
            status: ''
          };
        }
      }
      
      setClientsMap(newClientsMap);
    };

    if (uniqueClientIds.length > 0) {
      loadClients();
    }
  }, [uniqueClientIds]);

  const activeOrders = useMemo(() => {
    return orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return activeOrders.filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (currencyFilter !== 'all' && order.currency !== currencyFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return order.orderId?.toLowerCase().includes(s) ||
               order.clientId?.toString().includes(s) ||
               order.beneficiaryName?.toLowerCase().includes(s) ||
               order.bic?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [activeOrders, statusFilter, currencyFilter, search]);

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
    if (checked) {
      setSelectedIds(new Set(filteredOrders.map(o => o.orderId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id, checked) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleStatusChange = (order, newStatus) => {
    updateMutation.mutate({
      id: order.orderId,
      data: { 
        status: newStatus, 
        status_history: addStatusEntry(order.status_history, newStatus)
      }
    });
    toast.success(`Status changed to ${newStatus}`);
  };

  const handleToggleInvoice = (order) => {
    const newInvoice = !order.invocieReceived;
    updateMutation.mutate({ 
      id: order.orderId, 
      data: { invocie_received: newInvoice } 
    });
    toast.success(`Invoice ${newInvoice ? 'received' : 'pending'}`);
  };

  const handleTogglePaymentProof = (order) => {
    const newProof = !order.paymentProof;
    const data = { 
      payment_proof: newProof,
      date_payment_proof: newProof ? new Date().toISOString().split('T')[0] : ''
    };
    
    // If payment proof is set and status is pending_payment, move to on_execution
    if (newProof && order.status === 'pending_payment') {
      data.status = 'on_execution';
      data.status_history = addStatusEntry(order.status_history, 'on_execution');
    }
    
    updateMutation.mutate({ id: order.orderId, data });
    toast.success(`Payment proof ${newProof ? 'confirmed' : 'removed'}`);
  };

  const handleCreateInstruction = async () => {
    const selectedOrderIds = Array.from(selectedIds);
    if (selectedOrderIds.length === 0) {
      toast.error('No orders selected');
      return;
    }

    try {
      const blob = await apiClient.exportTxtInstructions(selectedOrderIds);
      const filename = `${new Date().toISOString().slice(0,10).replace(/-/g,'')}_instruction.txt`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Instruction file created for ${selectedOrderIds.length} orders`);
      setSelectedIds(new Set());
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      toast.error('Failed to create instruction file: ' + (error.message || 'Unknown error'));
    }
  };

  const handleMarkAsExecuted = () => {
    const selectedOrders = filteredOrders.filter(o => selectedIds.has(o.orderId));
    if (selectedOrders.length === 0) {
      toast.error('No orders selected');
      return;
    }

    selectedOrders.forEach(order => {
      updateMutation.mutate({
        id: order.orderId,
        data: { 
          status: 'released',
          executed: true,
          status_history: addStatusEntry(order.status_history, 'released')
        }
      });
    });

    toast.success(`${selectedOrders.length} orders marked as executed`);
    setSelectedIds(new Set());
  };

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleDrawerSave = async (data) => {
    await apiClient.updateOrder(selectedOrder.orderId, data);
    toast.success('Order updated');
    setDrawerOpen(false);
    queryClient.invalidateQueries({ queryKey: ['staff-active-orders'] });
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">GTrans Staff</h1>
                  <span className="text-white/60">•</span>
                  <span className="text-white">Active Orders</span>
                </div>
                <Badge className="bg-[#f5a623] text-white">{activeOrders.length} orders</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('GTrans')}>
                <Button variant="outline" size="sm" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-1" />
                  Public Site
                </Button>
              </Link>
              {selectedIds.size > 0 && (
                <>
                  <span className="text-slate-400 text-sm">{selectedIds.size} selected</span>
                  <Button onClick={handleCreateInstruction} className="bg-[#1e3a5f] hover:bg-[#152a45]">
                    <FileDown className="w-4 h-4 mr-2" />
                    Create TXT Instruction
                  </Button>
                  <Button onClick={handleMarkAsExecuted} className="bg-[#f5a623] hover:bg-[#e09000] text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Executed
                  </Button>
                  <Button onClick={() => setDeleteDialogOpen(true)} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by order, client, beneficiary, BIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white border-slate-300 text-slate-800">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ACTIVE_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-300 text-slate-800">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="CNY">CNY</SelectItem>
              <SelectItem value="IDR">IDR</SelectItem>
            </SelectContent>
          </Select>
          {(statusFilter !== 'all' || currencyFilter !== 'all' || search) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setStatusFilter('all'); setCurrencyFilter('all'); setSearch(''); }}
              className="text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Order ID</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Client</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Amount</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Beneficiary</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Account</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Bank/BIC</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Remark</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Inv Rcv</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Proof</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Non-M</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Inv#</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs">Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={14} className="text-center text-slate-500 py-8 text-xs">Loading...</TableCell></TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={14} className="text-center text-slate-500 py-8 text-xs">No active orders</TableCell></TableRow>
              ) : filteredOrders.map((order) => (
                <TableRow 
                  key={order.orderId} 
                  className={`border-slate-200 hover:bg-slate-50 ${order.nonMandiriExecution ? 'opacity-60' : ''}`}
                >
                  <TableCell className="py-2">
                    <Checkbox
                      checked={selectedIds.has(order.orderId)}
                      onCheckedChange={(checked) => handleSelectOne(order.orderId, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-[#1e3a5f] font-mono text-xs py-2">
                    <div className="flex items-center gap-1">
                      {order.orderId}
                      {order.invoiceFlag && <AlertTriangle className="w-3 h-3 text-[#f5a623]" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700 py-2">
                    <div className="text-xs">{clientsMap[order.clientId]?.name || '-'}</div>
                    <div className="text-xs text-slate-500 font-mono">{order.clientId}</div>
                  </TableCell>
                  <TableCell className="text-[#1e3a5f] font-medium text-xs py-2">
                    {order.amount?.toLocaleString()} {order.currency}
                  </TableCell>
                  <TableCell className="text-slate-700 max-w-[120px] py-2">
                    <div className="truncate text-xs">{order.beneficiaryName}</div>
                    <div className="text-xs text-slate-500 truncate">{order.beneficiaryAdress?.slice(0, 30)}</div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono text-xs max-w-[100px] truncate py-2">
                    {order.destinationAccount}
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs py-2">
                    <div className="truncate max-w-[100px]">{order.bankName}</div>
                    <div className="font-mono text-xs">{order.bankBic}</div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs max-w-[120px] truncate py-2">
                    {order.remark?.slice(0, 40)}
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge className={`text-xs ${order.invocieReceived ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                      {order.invocieReceived ? 'Y' : 'N'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge className={`text-xs ${order.paymentProof ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                      {order.paymentProof ? 'Y' : 'N'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge className={`text-xs ${order.nonMandiriExecution ? 'bg-orange-500' : 'bg-slate-300'}`}>
                      {order.nonMandiriExecution ? 'Y' : 'N'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 text-xs font-mono py-2">
                    {order.invoiceNumber || '-'}
                  </TableCell>
                  <TableCell className="py-2">
                    <Popover>
                      <PopoverTrigger>
                        <div className="cursor-pointer hover:opacity-80">
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-1 bg-white border-slate-200 shadow-lg">
                        <div className="space-y-1">
                          {ALL_STATUSES.map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order, s)}
                              className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-slate-100 text-slate-700 ${order.status === s ? 'bg-slate-100 font-medium' : ''}`}
                            >
                              {s.replace('_', ' ').toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="flex items-center gap-1 justify-end flex-wrap">
                      {order.attachmentSalesContract && (
                        <a href={order.attachmentSalesContract} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            <Download className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                      {order.attachmentInvoice && (
                        <a href={order.attachmentInvoice} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            <Download className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                      {order.attachmentOther && (
                        <a href={order.attachmentOther} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            <Download className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                      <Button 
                        onClick={() => downloadWordTemplate(order)} 
                        size="sm"
                        variant="outline"
                        className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white h-7 px-2 text-xs"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Order
                      </Button>
                      <Button 
                        onClick={() => openDrawer(order)} 
                        size="sm"
                        className="bg-[#1e3a5f] hover:bg-[#152a45] text-white h-7 px-2 text-xs"
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Terms
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <StaffOrderDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleDrawerSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Order(s)</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete the selected orders? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate([...selectedIds])}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}