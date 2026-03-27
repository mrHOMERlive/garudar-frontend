import React, { useState, useEffect } from 'react';
import apiClient from '@/api/apiClient';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [acting, setActing] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const result = await apiClient.getAlerts(params);
      setData(result);
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleAction = async (alertId, action) => {
    setActing(p => ({ ...p, [alertId]: true }));
    try {
      if (action === 'confirm') await apiClient.confirmAlert(alertId);
      else await apiClient.dismissAlert(alertId);
      toast.success(`Alert ${action}ed`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setActing(p => ({ ...p, [alertId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alerts</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 py-8 justify-center"><Loader2 className="w-5 h-5 animate-spin" /> Loading alerts...</div>
      ) : !data?.length ? (
        <div className="text-center text-slate-400 py-10 bg-white border border-slate-200 rounded-lg">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No alerts found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">{data.length} alert{data.length !== 1 ? 's' : ''}</p>
          {data.map(a => (
            <Card key={a.id} className={`border-l-4 ${a.status === 'pending' ? 'border-l-red-500' : a.status === 'confirmed' ? 'border-l-amber-500' : 'border-l-slate-300'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${a.status === 'pending' ? 'text-red-500' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800">{a.title || a.match_type || `Alert ${a.id}`}</div>
                      {a.customer_name && <div className="text-sm text-slate-500">Customer: {a.customer_name}</div>}
                      {a.description && <div className="text-sm text-slate-500 mt-0.5">{a.description}</div>}
                      {a.match_details?.aml_types?.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {a.match_details.aml_types.map(t => (
                            <Badge key={t} className={`text-xs ${
                              t === 'SANCTION' ? 'bg-red-600 text-white' :
                              t === 'SANCTION_RELATED' ? 'bg-red-400 text-white' :
                              t.startsWith('PEP') ? 'bg-orange-500 text-white' :
                              t.startsWith('ADVERSE_MEDIA') ? 'bg-yellow-600 text-white' :
                              'bg-slate-500 text-white'
                            }`}>{t}</Badge>
                          ))}
                        </div>
                      )}
                      {a.match_details?.entities?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {a.match_details.entities.map((e, i) => (
                            <div key={i} className="text-xs bg-red-50 border border-red-100 rounded px-2 py-1.5">
                              {e.name && <span className="font-medium text-slate-800">{e.name}</span>}
                              {e.sources?.length > 0 && (
                                <span className="text-slate-500 ml-1.5">— {e.sources.join(', ')}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <Badge className={a.status === 'pending' ? 'bg-red-500 text-white text-xs' : a.status === 'confirmed' ? 'bg-amber-500 text-white text-xs' : 'bg-slate-400 text-white text-xs'}>{a.status}</Badge>
                        {a.match_type && <Badge variant="outline" className="text-xs">{a.match_type}</Badge>}
                        {a.created_at && <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  {a.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => handleAction(a.id, 'confirm')} disabled={acting[a.id]}>
                        {acting[a.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => handleAction(a.id, 'dismiss')} disabled={acting[a.id]}>
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
