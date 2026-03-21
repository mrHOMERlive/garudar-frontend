import React, { useState, useEffect } from 'react';
import apiClient from '@/api/apiClient';
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle, Bell, Eye, TrendingUp, Loader2 } from 'lucide-react';

export default function SummaryStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getAmlSummary()
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items = [
    { label: 'Total Customers', value: stats?.total_customers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'High Risk', value: stats?.high_risk, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Open Cases', value: stats?.open_cases, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Open Alerts', value: stats?.open_alerts, icon: Bell, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Monitored', value: stats?.monitored, icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading summary...
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {items.map(item => (
        <Card key={item.label} className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <div className="text-xs text-slate-500">{item.label}</div>
              <div className="text-xl font-bold text-slate-800">{item.value ?? '—'}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
