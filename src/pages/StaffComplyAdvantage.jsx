import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Search,
  Shield,
  User,
  Building2,
  Loader2,
  ExternalLink,
  Eye,
  Bell,
  AlertTriangle,
  BarChart2,
} from 'lucide-react';
import { toast } from 'sonner';

import { t } from '@/components/utils/language';
import RiskBadge from '@/components/comply/RiskBadge';
import ScreeningForm from '@/components/comply/ScreeningForm';
import CustomerDetail from '@/components/comply/CustomerDetail';
import MonitoringPanel from '@/components/comply/MonitoringPanel';
import AlertsPanel from '@/components/comply/AlertsPanel';
import SummaryStats from '@/components/comply/SummaryStats';

function CustomerSearchPanel({ onSelectCustomer, reloadSignal = 0 }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Загрузка с учётом текущих фильтров. Используется и для initial-mount,
  // и для "Search" клика, и для reloadSignal (после успешного скрининга).
  const fetchList = useCallback(
    async (opts = {}) => {
      setLoading(true);
      try {
        const params = {};
        const s = opts.search ?? search;
        const tf = opts.typeFilter ?? typeFilter;
        const r = opts.riskFilter ?? riskFilter;
        if (s) params.search = s;
        if (tf && tf !== 'all') params.type = tf;
        if (r && r !== 'all') params.risk_level = r;
        const data = await apiClient.searchAmlCustomers(params);
        setResults(data);
      } catch (err) {
        toast.error(err.message || t('caSearchFailedToast'));
      } finally {
        setLoading(false);
      }
    },
    [search, typeFilter, riskFilter]
  );

  // Auto-load при первом монтировании вкладки Customers.
  // Используем раздельный effect без зависимостей чтобы избежать двойного запроса
  // когда меняются search/typeFilter/riskFilter (их мы перезапрашиваем только по кнопке Search).
  useEffect(() => {
    fetchList({ search: '', typeFilter: 'all', riskFilter: 'all' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload после внешнего события (новый скрининг). reloadSignal увеличивается
  // родителем, передаётся сюда. Пропускаем 0 (initial value).
  useEffect(() => {
    if (reloadSignal > 0) {
      fetchList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadSignal]);

  const handleSearch = () => fetchList();

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t('caSearchByNamePlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="person">Person</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={loading} className="bg-[#1e3a5f] hover:bg-[#152a45]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-1" />} Search
        </Button>
      </div>

      {loading && results === null && (
        <div className="flex items-center gap-2 text-slate-500 py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading customers...
        </div>
      )}

      {results && (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">{results.length ?? 0} results</p>
          {results.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white border border-slate-200 rounded-lg">
              No customers found
            </div>
          ) : (
            results.map((customer) => (
              <Card
                key={customer.id}
                className="border-slate-200 hover:border-[#1e3a5f] hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onSelectCustomer(customer)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${customer.type === 'person' ? 'bg-blue-50' : 'bg-amber-50'}`}
                      >
                        {customer.type === 'person' ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Building2 className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{customer.name}</div>
                        {customer.external_identifier && (
                          <div className="text-xs text-slate-400 font-mono">{customer.external_identifier}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={customer.risk_level} />
                      <Badge variant="outline" className="text-xs capitalize">
                        {customer.type}
                      </Badge>
                      {customer.monitored && (
                        <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Mon.
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function StaffComplyAdvantage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // Счётчик-сигнал для CustomerSearchPanel: инкрементим после успешного скрининга,
  // чтобы список перезапросился без F5.
  const [customersReload, setCustomersReload] = useState(0);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setActiveTab('search');
  };

  const handleScreeningSuccess = useCallback(() => {
    setCustomersReload((n) => n + 1);
  }, []);

  if (selectedCustomer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader onBack={() => navigate('/staffdashboard')} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader onBack={() => navigate('/staffdashboard')} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <SummaryStats />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <BarChart2 className="w-4 h-4 mr-1.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-1.5" /> Customers
            </TabsTrigger>
            <TabsTrigger
              value="screen_person"
              className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
            >
              <User className="w-4 h-4 mr-1.5" /> Screen Person
            </TabsTrigger>
            <TabsTrigger
              value="screen_company"
              className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
            >
              <Building2 className="w-4 h-4 mr-1.5" /> Screen Company
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-1.5" /> Monitoring
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-1.5" /> Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('screen_person')}
                  className="group text-left p-5 bg-white rounded-xl border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">Screen Individual</div>
                  <div className="text-xs text-slate-500 mt-1">Sanctions, PEP & adverse media check for a person</div>
                </button>
                <button
                  onClick={() => setActiveTab('screen_company')}
                  className="group text-left p-5 bg-white rounded-xl border border-amber-100 hover:border-amber-400 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                    <Building2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">Screen Company</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Sanctions & adverse media check for a corporate entity
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('monitoring')}
                  className="group text-left p-5 bg-white rounded-xl border border-indigo-100 hover:border-indigo-400 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                    <Eye className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">Ongoing Monitoring</div>
                  <div className="text-xs text-slate-500 mt-1">View customers under continuous surveillance</div>
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="group text-left p-5 bg-white rounded-xl border border-red-100 hover:border-red-400 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">Review Alerts</div>
                  <div className="text-xs text-slate-500 mt-1">Confirm or dismiss pending compliance alerts</div>
                </button>
              </div>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-[#1e3a5f] text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> About This Module
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                    {[
                      'Screen individuals & companies against global sanctions lists',
                      'PEP (Politically Exposed Persons) database checks',
                      'Adverse media monitoring',
                      'Continuous monitoring with real-time alerts',
                      'Risk scoring with manual override capability',
                      'Case management for compliance workflows',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-lg">Customer Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerSearchPanel onSelectCustomer={handleSelectCustomer} reloadSignal={customersReload} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="screen_person">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-lg">Screen an Individual</CardTitle>
                <p className="text-sm text-slate-500">Sanctions, PEP registers, and adverse media checks.</p>
              </CardHeader>
              <CardContent>
                <ScreeningForm type="person" onResult={handleScreeningSuccess} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="screen_company">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-lg">Screen a Company</CardTitle>
                <p className="text-sm text-slate-500">Sanctions and adverse media checks for corporate entities.</p>
              </CardHeader>
              <CardContent>
                <ScreeningForm type="company" onResult={handleScreeningSuccess} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" /> Monitored Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonitoringPanel onSelectCustomer={handleSelectCustomer} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertsPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PageHeader({ onBack }) {
  return (
    <header className="bg-[#1e3a5f] border-b shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
              <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">AML Screening</h1>
                <span className="text-xs bg-[#f5a623] px-2 py-1 rounded text-white font-medium">ComplyAdvantage</span>
              </div>
              <p className="text-slate-300 text-xs">Sanctions · PEP · Adverse Media · Monitoring · Risk Scoring</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
