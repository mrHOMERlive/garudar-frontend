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
import { ArrowLeft, Search, Eye, Globe } from 'lucide-react';
import StaffExecutedDrawer from '@/components/staff/StaffExecutedDrawer';

export default function StaffExecutedOrders() {
  const [search, setSearch] = useState('');
  const [settledFilter, setSettledFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['staff-executed-orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const executedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'released' || o.status === 'rejected');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return executedOrders.filter(order => {
      if (settledFilter !== 'all' && order.settled !== settledFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return order.orderId?.toLowerCase().includes(s) ||
          order.clientId?.toString().includes(s) ||
          order.beneficiaryName?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [executedOrders, settledFilter, search]);

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
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png" alt="Logo" className="w-full h-full object-contain" />
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
              <Button variant="outline" size="sm" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                <Globe className="w-4 h-4 mr-1" />
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

        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold">Order ID</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Client</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Amount</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Beneficiary</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Bank/BIC</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">MT103</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Settled</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Refund</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center text-slate-500 py-8">Loading...</TableCell></TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-slate-500 py-8">No executed orders</TableCell></TableRow>
              ) : filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="text-[#1e3a5f] font-mono text-sm">{order.orderId}</TableCell>
                  <TableCell className="text-slate-700">{order.clientId || '-'}</TableCell>
                  <TableCell className="text-[#1e3a5f] font-medium">
                    {parseFloat(order.amount)?.toLocaleString()} {order.currency}
                  </TableCell>
                  <TableCell className="text-slate-700 max-w-[150px] truncate">{order.beneficiaryName}</TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    <div>{order.bankName?.slice(0, 20)}</div>
                    <div className="font-mono text-xs">{order.bic}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={order.mt103_status === 'sent' ? 'bg-emerald-600' : 'bg-slate-400'}>
                      {order.mt103_status === 'sent' ? 'Sent' : 'Not Sent'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      order.settled === 'Y' ? 'bg-emerald-600' :
                        order.settled === 'N' ? 'bg-red-500' : 'bg-slate-400'
                    }>
                      {order.settled || 'NA'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={order.refund ? 'bg-[#f5a623]' : 'bg-slate-400'}>
                      {order.refund ? 'Y' : 'N'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => openDrawer(order)}
                      className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <StaffExecutedDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={(data) => {
          updateMutation.mutate({ id: selectedOrder.id, data });
        }}
      />
    </div>
  );
}