import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Eye, Globe } from 'lucide-react';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import ClientExecutedDrawer from '@/components/client/ClientExecutedDrawer';
import moment from 'moment';

export default function ExecutedOrders() {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['executed-orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const executedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'released' || o.status === 'rejected');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return executedOrders.filter(order => {
      if (search) {
        const s = search.toLowerCase();
        return order.orderId?.toLowerCase().includes(s) ||
          order.beneficiaryName?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [executedOrders, search]);

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
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded text-white font-medium">CLIENT</span>
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

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="text-[#1e3a5f] font-semibold">Order ID</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Date</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Amount</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Beneficiary</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Bank</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Transaction Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">MT103</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Act Report</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading">
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500">Loading...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow key="empty">
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500">No executed orders</TableCell>
                </TableRow>
              ) : filteredOrders.map((order) => (
                <TableRow key={order.orderId || order.id} className="hover:bg-blue-50">
                  <TableCell className="font-mono text-sm text-[#1e3a5f]">{order.orderId}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {moment(order.updatedAt).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell className="font-semibold text-blue-600">
                    {order.amount?.toLocaleString()} {order.currency}
                  </TableCell>
                  <TableCell className="text-slate-700 max-w-[200px] truncate">
                    {order.beneficiaryName}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {order.bankName?.slice(0, 25)}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-600 text-white">Executed</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={order.transactionStatusReceived ? 'bg-blue-600' : 'bg-slate-400'}>
                      {order.transactionStatusReceived ? 'Y' : 'N'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={order.mt103Received ? 'bg-blue-600' : 'bg-slate-400'}>
                      {order.mt103Received ? 'Y' : 'N'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      order.actReportStatus === 'signed' ? 'bg-blue-600' :
                        order.actReportStatus === 'on_sign' ? 'bg-amber-500' : 'bg-slate-400'
                    }>
                      {order.actReportStatus === 'signed' ? 'Signed' :
                        order.actReportStatus === 'on_sign' ? 'On Sign' : 'Not Made'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDrawerOpen(true);
                      }}
                      className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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