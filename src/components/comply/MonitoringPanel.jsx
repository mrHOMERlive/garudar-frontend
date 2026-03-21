import React, { useState, useEffect } from 'react';
import apiClient from '@/api/apiClient';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import RiskBadge from './RiskBadge';
import { Eye, User, Building2, Loader2, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function MonitoringPanel({ onSelectCustomer }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riskFilter, setRiskFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [disabling, setDisabling] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (riskFilter !== 'all') params.risk_level = riskFilter;
      const result = await apiClient.getMonitoredCustomers(params);
      setData(result);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [riskFilter]);

  const handleDisable = async (customerId, e) => {
    e.stopPropagation();
    setDisabling(p => ({ ...p, [customerId]: true }));
    try {
      await apiClient.toggleMonitoring(customerId, { enabled: false });
      toast.success('Monitoring disabled');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setDisabling(p => ({ ...p, [customerId]: false }));
    }
  };

  const filtered = (data || []).filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.external_identifier?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input placeholder="Filter by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 py-8 justify-center"><Loader2 className="w-5 h-5 animate-spin" /> Loading monitored customers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-10 bg-white border border-slate-200 rounded-lg">
          <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No monitored customers found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">{filtered.length} monitored customer{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map(customer => (
            <Card key={customer.id} className="border-slate-200 hover:border-[#1e3a5f] hover:shadow-sm transition-all cursor-pointer" onClick={() => onSelectCustomer(customer)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${customer.type === 'person' ? 'bg-blue-50' : 'bg-amber-50'}`}>
                      {customer.type === 'person' ? <User className="w-4 h-4 text-blue-600" /> : <Building2 className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{customer.name}</div>
                      {customer.external_identifier && <div className="text-xs text-slate-400 font-mono">{customer.external_identifier}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={customer.risk_level} />
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs"><Eye className="w-3 h-3 mr-1" />Monitored</Badge>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={(e) => handleDisable(customer.id, e)} disabled={disabling[customer.id]}>
                      {disabling[customer.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
