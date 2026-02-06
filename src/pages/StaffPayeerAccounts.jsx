import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, Globe } from 'lucide-react';

import CountrySelector from '../components/kyc/CountrySelector';

const CURRENCIES = ['USD', 'EUR', 'CNY', 'IDR', 'RUB', 'BRL', 'AED', 'INR', 'ARS', 'COP', 'PEN'];

export default function StaffPayeerAccounts() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    currency: 'USD',
    account_number: '',
    bank_name: '',
    bank_address: '',
    bank_corr_account: '',
    bank_bic: '',
    bank_country: '',
    active: true
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await apiClient.getCountries();
        setCountries(Array.isArray(countriesData) ? countriesData : []);
      } catch (error) {
        console.error('Failed to load countries:', error);
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['payeer-accounts'],
    queryFn: async () => {
      const data = await apiClient.getPayeerAccounts();
      return data.map(acc => ({
        id: acc.account_no,
        account_number: acc.account_no,
        bank_name: acc.bank_name || '',
        bank_address: acc.bank_address || '',
        bank_corr_account: acc.bank_corr_account || '',
        bank_bic: acc.bank_bic || '',
        bank_country: acc.bank_country || '',
        currency: acc.currency || 'USD',
        active: acc.status !== 'inactive'
      }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        currency: data.currency,
        status: data.active ? 'active' : 'inactive',
        bank_name: data.bank_name || null,
        bank_address: data.bank_address || null,
        bank_corr_account: data.bank_corr_account || null,
        bank_bic: data.bank_bic || null,
        bank_country: data.bank_country || null
      };

      if (editingAccount) {
        return await apiClient.updatePayeerAccount(editingAccount.account_number, payload);
      }

      const createPayload = {
        account_no: data.account_number,
        ...payload
      };
      return await apiClient.createPayeerAccount(createPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payeer-accounts'] });
      toast.success(editingAccount ? 'Account updated' : 'Account created');
      closeDrawer();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      const account = accounts.find(acc => acc.id === id);
      return apiClient.deletePayeerAccount(account?.account_number || id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payeer-accounts'] });
      toast.success('Account deleted');
      closeDrawer();
    },
  });

  const openCreateDrawer = () => {
    setEditingAccount(null);
    setFormData({
      currency: 'USD',
      account_number: '',
      bank_name: '',
      bank_address: '',
      bank_corr_account: '',
      bank_bic: '',
      bank_country: '',
      active: true
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (account) => {
    setEditingAccount(account);
    setFormData({
      currency: account.currency,
      account_number: account.account_number,
      bank_name: account.bank_name || '',
      bank_address: account.bank_address || '',
      bank_corr_account: account.bank_corr_account || '',
      bank_bic: account.bank_bic || '',
      bank_country: account.bank_country || '',
      active: account.active !== false
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingAccount(null);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteMutation.mutate(editingAccount.id);
    }
  };

  const handleSubmit = () => {
    if (!formData.currency || !formData.account_number) {
      toast.error('Please fill all required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
                  <span className="text-white">Payeer Accounts</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('GTrans')}>
                <Button variant="outline" size="sm" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-1" />
                  Public Site
                </Button>
              </Link>
              <Button onClick={openCreateDrawer} className="bg-[#f5a623] hover:bg-[#e09000] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold w-24">Currency</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Account Number</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Bank Name</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Country</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">Loading...</TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">No accounts found</TableCell>
                </TableRow>
              ) : accounts.map((account) => (
                <TableRow
                  key={account.id}
                  className="border-slate-200 hover:bg-slate-100 cursor-pointer"
                  onClick={() => openEditDrawer(account)}
                >
                  <TableCell>
                    <Badge className="bg-[#f5a623] text-white">{account.currency}</Badge>
                  </TableCell>
                  <TableCell className="text-[#1e3a5f] font-mono">{account.account_number}</TableCell>
                  <TableCell className="text-slate-700">{account.bank_name || '-'}</TableCell>
                  <TableCell className="text-slate-600">{account.bank_country || '-'}</TableCell>
                  <TableCell>
                    <Badge className={account.active !== false ? 'bg-emerald-600' : 'bg-slate-400'}>
                      {account.active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-white">
          <SheetHeader className="border-b border-slate-200 pb-4">
            <SheetTitle className="text-[#1e3a5f]">
              {editingAccount ? 'Edit Account' : 'Add Payeer Account'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label className="text-slate-700">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Account Number *</Label>
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Account number"
                className="bg-white border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Bank Name</Label>
              <Input
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Bank name"
                className="bg-white border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Bank Address</Label>
              <Input
                value={formData.bank_address}
                onChange={(e) => setFormData({ ...formData, bank_address: e.target.value })}
                placeholder="Bank address"
                className="bg-white border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Bank Correspondent Account</Label>
              <Input
                value={formData.bank_corr_account}
                onChange={(e) => setFormData({ ...formData, bank_corr_account: e.target.value })}
                placeholder="Correspondent account"
                className="bg-white border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Bank BIC/SWIFT</Label>
              <Input
                value={formData.bank_bic}
                onChange={(e) => setFormData({ ...formData, bank_bic: e.target.value })}
                placeholder="BIC/SWIFT code"
                className="bg-white border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Bank Country</Label>
              <CountrySelector
                value={formData.bank_country}
                onChange={(value) => setFormData({ ...formData, bank_country: value })}
                language="en"
                countries={countries}
                saveName={true}
                placeholder="Select country"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-slate-700">Active</Label>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>

          <SheetFooter className="border-t border-slate-200 pt-4">
            {editingAccount && (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white mr-auto"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
            <Button variant="outline" onClick={closeDrawer} className="border-slate-300 text-slate-600">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#152a45]">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}