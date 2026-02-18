import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { ArrowLeft, Search, Globe, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import moment from 'moment';
import StaffExecutedDrawer from '@/components/staff/StaffExecutedDrawer';

export default function StaffExecutedOrders() {
  const [search, setSearch] = useState('');
  const [settledFilter, setSettledFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getAllClients(),
  });

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ['staff-executed-orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const { data: executedOrdersList = [] } = useQuery({
    queryKey: ['executed-orders-list'],
    queryFn: () => apiClient.getExecutedOrders(),
  });

  const orders = useMemo(() => {
    return rawOrders.map(order => {
      const client = clients.find(c => c.client_id === order.clientId);
      const executedDetails = executedOrdersList.find(e => e.sourceOrderId === order.orderId) || {};

      return {
        ...order,
        id: order.orderId,
        order_number: order.orderId,
        client_name: client?.client_name || client?.username || order.clientId,
        updated_date: order.updatedAt,
        amount: Number(order.amount),
        beneficiary_name: order.beneficiaryName,
        bank_name: order.bankName,

        // Merge executed details
        executedId: executedDetails.executedId,

        // Map fields for UI (merging both sources, prioritizing executedDetails)
        mt103_received: executedDetails.mt103Status === 'sent' || order.mt103Received || order.mt103_received, // Logic might differ, checking status
        transaction_status_received: (executedDetails.transactionStatusStatus === 'Y') || order.transactionStatusReceived || order.transaction_status_received,
        act_report_status: executedDetails.docPackageStatus || order.actReportStatus || order.act_report_status,
        settled: executedDetails.settledStatus || order.settled || 'NA',
        refund: (executedDetails.refundFlag === 'Y') || order.refund,
        staff_description: executedDetails.staffDescription || order.staff_description,

        // New fields from ExecutedOrder
        mt103_no: executedDetails.mt103No,
        mt103_date: executedDetails.mt103Date,
        transaction_status_no: executedDetails.transactionStatusNo,
        transaction_status_date: executedDetails.transactionStatusDate,
        transaction_status_status: executedDetails.transactionStatusStatus,
        act_report_no: executedDetails.actReportNo,
        act_report_date: executedDetails.actReportDate,
        doc_package_status: executedDetails.docPackageStatus,

        // File URLs from ExecutedOrder (prioritize these)
        attachment_mt103: executedDetails.mt103FileUrl,
        attachment_transaction_status: executedDetails.transactionStatusFileUrl,
        attachment_act_report_signed: executedDetails.actReportFileUrl,

        // Pass through other fields
        status: order.status,
        executed: order.executed,
      };
    });
  }, [rawOrders, clients, executedOrdersList]);

  const executedOrders = useMemo(() => {
    return orders.filter(o => o.executed === true || o.executed === 'true');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const filtered = executedOrders.filter(order => {
      if (settledFilter !== 'all' && order.settled !== settledFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return order.order_number?.toLowerCase().includes(s) ||
          order.client_name?.toLowerCase().includes(s) ||
          order.beneficiary_name?.toLowerCase().includes(s);
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.updated_date).getTime();
      const dateB = new Date(b.updated_date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [executedOrders, settledFilter, search, sortOrder]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredOrders.length);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-executed-orders'] });
      toast.success('Order updated');
    },
  });

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full">
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
                  <span className="text-white">Executed Orders</span>
                </div>
                <Badge className="bg-emerald-600 text-white">{executedOrders.length} orders</Badge>
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

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <Select value={settledFilter} onValueChange={setSettledFilter}>
            <SelectTrigger className="w-48 bg-white border-slate-300 text-slate-800">
              <SelectValue placeholder="Filter by settled" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Y">Settled</SelectItem>
              <SelectItem value="N">Not Settled</SelectItem>
              <SelectItem value="NA">N/A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Showing {startIndex}-{endIndex} of {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </p>
            <p className="text-xs text-slate-400 italic">Click on an order to view details</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold text-sm">Order ID</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-sm">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 hover:text-[#152a45] transition-colors"
                  >
                    Date
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-sm">Amount</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-sm">Beneficiary</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-sm">Bank</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-sm text-center">Transaction<br />Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-sm text-center">MT103</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-sm text-center pr-6">Act<br />Report</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-500 py-8">Loading...</TableCell></TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-500 py-8">No executed orders</TableCell></TableRow>
              ) : paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-slate-200 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => openDrawer(order)}
                >
                  <TableCell className="text-[#1e3a5f] font-mono text-sm py-4">{order.order_number}</TableCell>
                  <TableCell className="text-sm text-slate-900 py-4">
                    {moment(order.updated_date).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-blue-600 tabular-nums py-4">
                    {order.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}
                  </TableCell>
                  <TableCell className="text-sm text-slate-900 py-4">{order.beneficiary_name}</TableCell>
                  <TableCell className="text-sm text-slate-900 py-4">{order.bank_name}</TableCell>
                  <TableCell className="text-center py-4">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${order.transaction_status_received ? 'bg-green-100' : 'bg-red-100'}`}>
                      {order.transaction_status_received ?
                        <CheckCircle className="w-5 h-5 text-green-600" /> :
                        <XCircle className="w-5 h-5 text-red-600" />
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${order.mt103_received ? 'bg-green-100' : 'bg-red-100'}`}>
                      {order.mt103_received ?
                        <CheckCircle className="w-5 h-5 text-green-600" /> :
                        <XCircle className="w-5 h-5 text-red-600" />
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 pr-6">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${order.act_report_status === 'signed' ? 'bg-green-100' :
                      order.act_report_status === 'on_sign' ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                      {order.act_report_status === 'signed' ?
                        <CheckCircle className="w-5 h-5 text-green-600" /> :
                        order.act_report_status === 'on_sign' ?
                          <MinusCircle className="w-5 h-5 text-amber-600" /> :
                          <XCircle className="w-5 h-5 text-red-600" />
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
      </main>

      <StaffExecutedDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={(data) => {
          queryClient.invalidateQueries({ queryKey: ['staff-executed-orders'] });
          queryClient.invalidateQueries({ queryKey: ['executed-orders-list'] });
        }}
      />
    </div>
  );
}