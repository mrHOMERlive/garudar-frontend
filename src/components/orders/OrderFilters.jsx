import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { t } from '@/components/utils/language';

export default function OrderFilters({ filters, onFilterChange, onClear }) {
  const hasActiveFilters =
    filters.search || filters.status !== 'all' || filters.currency !== 'all' || filters.dateFrom || filters.dateTo;

  const STATUSES = [
    { value: 'all', label: t('allStatuses') },
    { value: 'DRAFT', label: t('draft') },
    { value: 'CHECK', label: t('check') },
    { value: 'REJECTED', label: t('rejected') },
    { value: 'CLIENT_CANCELED', label: t('statusClientCanceledLabel') },
    { value: 'ON_EXECUTION', label: t('on_execution') },
    { value: 'RELEASED', label: t('released') },
  ];

  const CURRENCIES = [
    { value: 'all', label: t('allCurrencies') },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'CNY', label: 'CNY' },
    { value: 'IDR', label: 'IDR' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        <Filter className="w-4 h-4" />
        <span className="font-medium">{t('filtersLabel')}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t('filterSearchByOrderBeneficiaryBic')}
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        <Select value={filters.status} onValueChange={(value) => onFilterChange({ status: value })}>
          <SelectTrigger>
            <SelectValue placeholder={t('statusPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.currency} onValueChange={(value) => onFilterChange({ currency: value })}>
          <SelectTrigger>
            <SelectValue placeholder={t('currencyPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder={t('fromDatePlaceholder')}
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
        />

        <Input
          type="date"
          placeholder={t('toDatePlaceholder')}
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ dateTo: e.target.value })}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-600">
            <X className="w-4 h-4 mr-1" />
            {t('clearFiltersBtnLabel')}
          </Button>
        </div>
      )}
    </div>
  );
}
