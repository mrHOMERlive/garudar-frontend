import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from 'lucide-react';

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'created', label: 'Created' },
  { value: 'check', label: 'Check' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'on_execution', label: 'On Execution' },
  { value: 'released', label: 'Released' },
  { value: 'cancelled', label: 'Cancelled' }
];

const CURRENCIES = [
  { value: 'all', label: 'All Currencies' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'CNY', label: 'CNY' },
  { value: 'IDR', label: 'IDR' }
];

export default function OrderFilters({ filters, onFilterChange, onClear }) {
  const hasActiveFilters = filters.search || filters.status !== 'all' || 
    filters.currency !== 'all' || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by Order ID, Beneficiary, BIC..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange({ status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.currency}
          onValueChange={(value) => onFilterChange({ currency: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder="From date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
        />

        <Input
          type="date"
          placeholder="To date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ dateTo: e.target.value })}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-slate-600"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}