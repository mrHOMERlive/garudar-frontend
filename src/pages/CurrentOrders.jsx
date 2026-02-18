import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Search, FileText, Globe, MoreVertical, ChevronDown, ArrowUpDown, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import ClientTermsDrawer from '@/components/client/ClientTermsDrawer';
import moment from 'moment';

const ACTIVE_STATUSES = ['created', 'DRAFT', 'CHECK', 'ON_EXECUTION'];

export default function CurrentOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  const { data: myClient } = useQuery({
    queryKey: ['my-client'],
    queryFn: () => apiClient.getMyClient(),
  });

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['current-orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const currentOrders = useMemo(() => {
    return orders.filter(o => {
      // Only show orders for current client
      if (myClient && o.clientId !== myClient.client_id) {
        return false;
      }
      // Only show active orders
      return o.status !== 'cancelled' &&
        o.status !== 'client_canceled' &&
        !o.executed &&
        !o.deleted &&
        o.status !== 'released';
    });
  }, [orders, myClient]);

  const filteredOrders = useMemo(() => {
    const filtered = currentOrders.filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return order.orderId?.toLowerCase().includes(s) ||
          order.beneficiaryName?.toLowerCase().includes(s);
      }
      return true;
    });

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [currentOrders, statusFilter, search, sortOrder]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredOrders.length);

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.orderId));
    }
  };

  const cancelSelected = async () => {
    if (!selectedOrders.length) return;
    try {
      await Promise.all(
        selectedOrders.map(id =>
          apiClient.updateOrder(id, { status: 'canceled' })
        )
      );
      toast.success(`${selectedOrders.length} order(s) cancelled`);
      setSelectedOrders([]);
      refetch();
    } catch (error) {
      toast.error('Failed to cancel orders');
    }
  };

  const deleteSelected = async () => {
    if (!selectedOrders.length) return;
    try {
      await Promise.all(
        selectedOrders.map(id =>
          apiClient.updateOrder(id, { deleted: true })
        )
      );
      toast.success(`${selectedOrders.length} order(s) deleted`);
      setSelectedOrders([]);
      refetch();
    } catch (error) {
      toast.error('Failed to delete orders');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('UserDashboard')}>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">GTrans</h1>
                  <span className="text-xs bg-emerald-500 px-2 py-1 rounded text-white font-medium">CLIENT</span>
                </div>
                <p className="text-slate-300 text-sm">Current Orders</p>
              </div>
            </div>
            <Link to={createPageUrl('GTrans')}>
              <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                <Globe className="w-4 h-4 mr-2" />
                Public Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200 rounded-lg"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10 bg-white border-slate-200 rounded-lg">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="pending_payment">Pending Payment</SelectItem>
              <SelectItem value="on_execution">On Execution</SelectItem>
            </SelectContent>
          </Select>
          {selectedOrders.length > 0 && (
            <>
              <Button
                onClick={cancelSelected}
                variant="outline"
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Selected ({selectedOrders.length})
              </Button>
              <Button
                onClick={deleteSelected}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedOrders.length})
              </Button>
            </>
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Showing {startIndex}-{endIndex} of {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </p>
            <p className="text-xs text-slate-400 italic">Click on an order to view details</p>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50">
                <TableHead className="w-12 pl-6 py-3">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-sm font-medium text-slate-900 py-3">Order ID</TableHead>
                <TableHead className="text-sm font-medium text-slate-900 py-3">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    Date
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="text-sm font-medium text-slate-900 py-3">Amount</TableHead>
                <TableHead className="text-sm font-medium text-slate-900 py-3">Beneficiary</TableHead>
                <TableHead className="text-sm font-medium text-slate-900 py-3">Bank</TableHead>
                <TableHead className="text-sm font-medium text-slate-900 py-3 pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <p className="text-slate-500">No orders found</p>
                    {(search || statusFilter !== 'all') && (
                      <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.map((order) => (
                <TableRow
                  key={order.orderId}
                  className="hover:bg-blue-50/50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <TableCell className="pl-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedOrders.includes(order.orderId)}
                      onCheckedChange={() => toggleOrderSelection(order.orderId)}
                    />
                  </TableCell>
                  <TableCell className="py-4 cursor-pointer" onClick={() => openDrawer(order)}>
                    <span className="text-sm text-slate-900">{order.orderId}</span>
                  </TableCell>
                  <TableCell className="py-4 cursor-pointer" onClick={() => openDrawer(order)}>
                    <span className="text-sm text-slate-900">{moment(order.createdAt).format('DD/MM/YYYY')}</span>
                  </TableCell>
                  <TableCell className="py-4 cursor-pointer" onClick={() => openDrawer(order)}>
                    <span className="text-sm font-semibold text-blue-600 tabular-nums">
                      {order.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 cursor-pointer" onClick={() => openDrawer(order)}>
                    <span className="text-sm text-slate-900">{order.beneficiaryName}</span>
                  </TableCell>
                  <TableCell className="py-4 cursor-pointer" onClick={() => openDrawer(order)}>
                    <span className="text-sm text-slate-900">{order.bankName}</span>
                  </TableCell>
                  <TableCell className="py-4 pr-6 cursor-pointer" onClick={() => openDrawer(order)}>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-600 min-w-[100px] text-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                Loading...
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-500">No orders found</p>
              {(search || statusFilter !== 'all') && (
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
              )}
            </div>
          ) : paginatedOrders.map((order) => {
            const getPrimaryAction = (status) => {
              if (status === 'created' || status === 'draft') {
                return { label: 'View Terms', icon: FileText, action: () => openDrawer(order) };
              }
              if (status === 'check' || status === 'rejected') {
                return { label: 'Review', icon: FileText, action: () => openDrawer(order) };
              }
              if (status === 'pending_payment') {
                return { label: 'View Details', icon: FileText, action: () => openDrawer(order) };
              }
              return { label: 'View Terms', icon: FileText, action: () => openDrawer(order) };
            };

            const primaryAction = getPrimaryAction(order.status);

            return (
              <div key={order.orderId} className="bg-white border border-slate-200 rounded-xl p-4 active:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-slate-900 tabular-nums">
                      {order.currency} {order.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <OrderStatusBadge status={order.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex-shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openDrawer(order)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Terms
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <p className="text-sm font-medium text-slate-900 truncate">{order.beneficiaryName}</p>
                  <p className="text-sm text-slate-600 truncate">{order.bankName}</p>
                  <p className="text-xs text-slate-500">
                    {moment(order.createdAt).format('DD/MM/YYYY')} • {order.orderId}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={primaryAction.action}
                  className="w-full h-9 text-sm font-medium"
                >
                  <primaryAction.icon className="w-4 h-4 mr-2" />
                  {primaryAction.label}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Mobile Pagination */}
        {filteredOrders.length > 0 && (
          <div className="md:hidden mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Rows per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
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
