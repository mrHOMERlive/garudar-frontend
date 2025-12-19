import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Plus, FileDown, FileText, Home } from 'lucide-react';
import OrderFilters from '@/components/orders/OrderFilters';
import OrdersTable from '@/components/orders/OrdersTable';
import OrderDetailsDrawer from '@/components/orders/OrderDetailsDrawer';
import { exportOrdersToCSV } from '@/components/remittance/utils/csvGenerator';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 25;

const ACTIVE_STATUSES = ['DRAFT', 'CHECK', 'ON_EXECUTION'];

export default function CurrentOrders() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    currency: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Only show active orders (DRAFT, CHECK, ON_EXECUTION)
      if (!ACTIVE_STATUSES.includes(order.status)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          order.orderId?.toLowerCase().includes(searchLower) ||
          order.beneficiaryName?.toLowerCase().includes(searchLower) ||
          order.bic?.toLowerCase().includes(searchLower) ||
          order.bankName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }

      // Currency filter
      if (filters.currency !== 'all' && order.currency !== filters.currency) {
        return false;
      }

      // Date filters
      if (filters.dateFrom) {
        const orderDate = new Date(order.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const orderDate = new Date(order.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      currency: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleExportAll = () => {
    if (filteredOrders.length > 0) {
      exportOrdersToCSV(filteredOrders, `current_orders_${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (order) => apiClient.deleteOrder(order.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order deleted successfully');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (order) => apiClient.updateOrder(order.id, {
      ...order,
      status: 'REJECTED'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled');
    },
  });

  const handleDelete = (order) => {
    deleteMutation.mutate(order);
  };

  const handleCancel = (order) => {
    cancelMutation.mutate(order);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl('UserDashboard')} className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2.5 shadow-lg">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">GTrans</h1>
                  <span className="text-xs bg-amber-500 px-2 py-1 rounded text-white font-medium">CLIENT</span>
                </div>
                <p className="text-sm text-teal-300">Current Orders</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('UserDashboard')}>
                <Button
                  variant="outline"
                  className="border-teal-400 text-teal-100 hover:bg-teal-800/50 bg-transparent"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleExportAll}
                disabled={filteredOrders.length === 0}
                className="border-teal-400 text-teal-100 hover:bg-teal-800/50 bg-transparent"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Link to={createPageUrl('CreateOrder')}>
                <Button className="bg-teal-700 hover:bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filters */}
        <OrderFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {filteredOrders.length} active order{filteredOrders.length !== 1 ? 's' : ''} found
          </span>
          {filteredOrders.length > 0 && (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Table or Empty State */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No active orders</h3>
            <p className="text-slate-600 mb-6">
              {orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length === 0 
                ? "You don't have any orders in progress."
                : "No orders match your current filters."}
            </p>
            {orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length === 0 ? (
              <Link to={createPageUrl('CreateOrder')}>
                <Button className="bg-teal-700 hover:bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <OrdersTable 
              orders={paginatedOrders} 
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    // Show ellipsis
                    if (page === 2 && currentPage > 3) {
                      return <PaginationItem key={page}>...</PaginationItem>;
                    }
                    if (page === totalPages - 1 && currentPage < totalPages - 2) {
                      return <PaginationItem key={page}>...</PaginationItem>;
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>

      {/* Details Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
