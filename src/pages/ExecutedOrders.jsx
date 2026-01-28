import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Globe, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClientExecutedDrawer from '@/components/client/ClientExecutedDrawer';
import moment from 'moment';

export default function ExecutedOrders() {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['executed-orders'],
    queryFn: async () => {
      const response = await apiClient.getOrders();
      // Map API camelCase to UI snake_case
      return response.map(order => ({
        ...order,
        id: order.orderId,
        order_number: order.orderId,
        updated_date: order.updatedAt,
        amount: order.amount,
        currency: order.currency,
        beneficiary_name: order.beneficiaryName,
        beneficiary_address: order.beneficiaryAdress, // API has typo 'Adress'
        destination_account: order.destinationAccount,
        bank_name: order.bankName,
        bank_address: order.bankAddress,
        bic: order.bankBic,
        country_bank: order.bankCountry,
        transaction_remark: order.remark,
        transaction_reference: order.orderId,
        client_id: order.clientId,
        client_name: order.clientName, // May be undefined in API, drawer falls back to client_id
        debit_account_no: order.executingBank || '-', // Best guess mapping or placeholder

        // Status flags
        transaction_status_received: order.transactionStatusReceived || false,
        mt103_received: order.mt103Received || false,
        act_report_status: order.actReportStatus || 'not_made',
        executed: order.status === 'executed',
        status: order.status,
      }));
    },
  });

  const executedOrders = useMemo(() => {
    return orders.filter(o => o.executed || o.status === 'released' || o.status === 'executed');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const filtered = executedOrders.filter(order => {
      if (search) {
        const s = search.toLowerCase();
        return order.order_number?.toLowerCase().includes(s) ||
          order.beneficiary_name?.toLowerCase().includes(s);
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.updated_date).getTime();
      const dateB = new Date(b.updated_date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [executedOrders, search, sortOrder]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredOrders.length);

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
                <p className="text-slate-300 text-sm">Executed Orders</p>
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
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Showing {startIndex}-{endIndex} of {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </p>
            <p className="text-xs text-slate-400 italic">Click on any order to view full details</p>
          </div>
        )}

        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50">
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
                <TableHead className="text-sm font-medium text-slate-900 py-3 text-center">Transaction<br />Status</TableHead>
                <TableHead className="text-sm font-medium text-slate-900 py-3 text-center">MT103</TableHead>
                <TableHead className="text-sm font-medium text-slate-900 py-3 text-center pr-6">Act<br />Report</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <p className="text-slate-500">No executed orders</p>
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                  onClick={() => {
                    setSelectedOrder(order);
                    setDrawerOpen(true);
                  }}
                >
                  <TableCell className="py-4">
                    <span className="text-sm text-slate-900">{order.order_number}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm text-slate-900">{moment(order.updated_date).format('DD/MM/YYYY')}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm font-semibold text-blue-600 tabular-nums">
                      {Number(order.amount)?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm text-slate-900">{order.beneficiary_name}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm text-slate-900">{order.bank_name}</span>
                  </TableCell>
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

      <ClientExecutedDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={refetch}
      />
    </div>
  );
}