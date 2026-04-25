import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import ClientPageHeader from '@/components/user/ClientPageHeader';
import OrderMobileCard from '@/components/user/OrderMobileCard';
import { t } from '@/components/utils/language';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientCancelledDrawer from '@/components/client/ClientCancelledDrawer';
import { format } from 'date-fns';

export default function CancelledOrders() {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['cancelled-orders'],
    queryFn: () => apiClient.getOrders(),
  });

  const cancelledOrders = useMemo(() => {
    // Map API camelCase to UI snake_case
    return orders
      .filter((o) => o.status === 'canceled' || o.status === 'cancelled' || o.status === 'client_canceled') // Handle both spellings
      .map((o) => ({
        ...o,
        // UI fields mapping
        order_number: o.orderId,
        updated_date: o.updatedAt,
        beneficiary_name: o.beneficiaryName,
        bank_name: o.bankName,
        amount: o.amount,
        currency: o.currency,
        status: o.status,

        // Drawer fields mapping
        debit_account_no: o.debitAccountNumber || o.sourceAccount,
        transaction_reference: o.transactionReference,
        beneficiary_address:
          o.beneficiaryAddress || o.beneficiaryAdress || o.beneficiary_address || o.beneficiary_adress,
        destination_account: o.destinationAccount || o.beneficiaryAccount || o.destination_account,
        country_bank: o.bankCountry || o.country || o.bank_country,
        bic: o.bankBic || o.bic || o.bank_bic,
        bank_address: o.bankAddress || o.bankAdress || o.bank_address || o.bank_adress,
        transaction_remark: o.transactionDescr || o.remark || o.transactionRemark,
      }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const filtered = cancelledOrders.filter((order) => {
      if (search) {
        const s = search.toLowerCase();
        return order.order_number?.toLowerCase().includes(s) || order.beneficiary_name?.toLowerCase().includes(s);
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.updated_date).getTime();
      const dateB = new Date(b.updated_date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [cancelledOrders, search, sortOrder]);

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
      <ClientPageHeader
        subtitle={t('cancelledOrders')}
        badgeLabel={t('clientDashboard')}
        actions={
          <Link to={createPageUrl('GTrans')}>
            <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
              <Globe className="w-4 h-4 mr-2" />
              {t('publicSite')}
            </Button>
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder={t('searchCancelledPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {t('showing')} {startIndex}-{endIndex} {t('ofLabel')} {filteredOrders.length}{' '}
              {filteredOrders.length === 1 ? t('orderLabel') : t('ordersLabel')}
            </p>
            <p className="text-xs text-slate-400 italic">{t('clickToViewDetails')}</p>
          </div>
        )}

        {/* Mobile card view (<md) */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-500">{t('loadingDots')}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-500">{t('noCancelledOrders2')}</div>
          ) : (
            paginatedOrders.map((order) => (
              <OrderMobileCard
                key={order.order_number || order.id}
                order={{
                  ...order,
                  orderId: order.order_number,
                  beneficiaryName: order.beneficiary_name,
                  bankName: order.bank_name,
                }}
                onClick={() => {
                  setSelectedOrder(order);
                  setDrawerOpen(true);
                }}
                dateField="updated_date"
                variant="danger"
              />
            ))
          )}
        </div>

        {/* Desktop table view (≥md) */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-gradient-to-r from-red-50 to-slate-50">
                <TableHead className="text-slate-700 font-bold py-4">{t('orderId')}</TableHead>
                <TableHead className="text-slate-700 font-bold py-4">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 hover:text-red-600 transition-colors"
                  >
                    {t('date')}
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="text-slate-700 font-bold py-4">{t('amountLabel')}</TableHead>
                <TableHead className="text-slate-700 font-bold py-4">{t('beneficiaryLabel')}</TableHead>
                <TableHead className="text-slate-700 font-bold py-4 pr-6">{t('bankLabel')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    {t('loadingDots')}
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    {t('noCancelledOrders2')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow
                    key={order.order_number || order.id}
                    className="hover:bg-red-50 cursor-pointer transition-colors border-b border-slate-100"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDrawerOpen(true);
                    }}
                  >
                    <TableCell className="font-mono text-sm text-red-700 font-semibold py-4">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 py-4">
                      {format(new Date(order.updated_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 py-4 tabular-nums">
                      {order.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                      {order.currency}
                    </TableCell>
                    <TableCell className="text-slate-700 max-w-[200px] truncate py-4">
                      {order.beneficiary_name}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm max-w-[150px] truncate py-4 pr-6">
                      {order.bank_name}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredOrders.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-none md:border-t md:border-slate-200 mt-3 md:mt-0 md:-mt-[1px] md:bg-slate-50">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm text-slate-600">{t('rowsPerPage')}</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(val) => {
                    setItemsPerPage(Number(val));
                    setCurrentPage(1);
                  }}
                >
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
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs sm:text-sm text-slate-600 min-w-[100px] text-center">
                  {t('pageLabel')} {currentPage} {t('ofLabel')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ClientCancelledDrawer order={selectedOrder} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
