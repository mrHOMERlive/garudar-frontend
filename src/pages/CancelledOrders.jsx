import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, XCircle, Globe } from 'lucide-react';
import moment from 'moment';

export default function CancelledOrders() {
  const [search, setSearch] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['cancelled-orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const cancelledOrders = useMemo(() => {
    return orders.filter(o => o.status === 'CANCELLED');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return cancelledOrders.filter(order => {
      if (search) {
        const s = search.toLowerCase();
        return order.order_number?.toLowerCase().includes(s) ||
               order.beneficiary_name?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [cancelledOrders, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-700 border-b border-red-800/20 shadow-lg">
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
                  <span className="text-xs bg-white/20 px-2 py-1 rounded text-white font-medium">CLIENT</span>
                </div>
                <p className="text-red-100 text-sm">Cancelled Orders</p>
              </div>
            </div>
            <Link to={createPageUrl('GTrans')}>
              <Button className="bg-white text-red-700 hover:bg-red-50">
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
              placeholder="Search cancelled orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-red-700 font-semibold">Order ID</TableHead>
                <TableHead className="text-red-700 font-semibold">Date</TableHead>
                <TableHead className="text-red-700 font-semibold">Amount</TableHead>
                <TableHead className="text-red-700 font-semibold">Beneficiary</TableHead>
                <TableHead className="text-red-700 font-semibold">Bank</TableHead>
                <TableHead className="text-red-700 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No cancelled orders</TableCell>
                </TableRow>
              ) : filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm text-red-700">{order.order_number}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {moment(order.updated_date).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {order.amount?.toLocaleString()} {order.currency}
                  </TableCell>
                  <TableCell className="text-slate-700 max-w-[200px] truncate">
                    {order.beneficiary_name}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {order.bank_name?.slice(0, 25)}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-red-600 text-white">Cancelled</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}