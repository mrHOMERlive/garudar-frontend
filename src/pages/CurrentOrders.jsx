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
import { ArrowLeft, Search, FileText, Globe } from 'lucide-react';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import ClientTermsDrawer from '@/components/client/ClientTermsDrawer';
import moment from 'moment';

const ACTIVE_STATUSES = ['created', 'DRAFT', 'CHECK', 'ON_EXECUTION'];

export default function CurrentOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      return o.status !== 'canceled' && 
             !o.executed && 
             !o.deleted &&
             o.status !== 'released';
    });
  }, [orders, myClient]);

  const filteredOrders = useMemo(() => {
    return currentOrders.filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return order.orderId?.toLowerCase().includes(s) ||
               order.beneficiaryName?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [currentOrders, statusFilter, search]);

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
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
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="pending_payment">Pending Payment</SelectItem>
              <SelectItem value="on_execution">On Execution</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="text-[#1e3a5f] font-semibold">Actions</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Order ID</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Date</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Amount</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Beneficiary</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Bank</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">No current orders</TableCell>
                </TableRow>
              ) : filteredOrders.map((order) => (
                <TableRow key={order.orderId} className="hover:bg-blue-50">
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => openDrawer(order)}
                      className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Terms
                    </Button>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-[#1e3a5f]">{order.orderId}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {moment(order.createdAt).format('DD/MM/YYYY')}
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
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
