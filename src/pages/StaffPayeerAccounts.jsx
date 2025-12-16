import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Pencil, Trash2, Globe } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'CNY', 'IDR'];

export default function StaffPayeerAccounts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    currency: 'USD',
    id_payeer: '',
    account_number: '',
    account_name: '',
    active: true
  });

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['payeer-accounts'],
    queryFn: () => base44.entities.PayeerAccount.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingAccount) {
        return base44.entities.PayeerAccount.update(editingAccount.id, data);
      }
      return base44.entities.PayeerAccount.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payeer-accounts'] });
      toast.success(editingAccount ? 'Account updated' : 'Account created');
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PayeerAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payeer-accounts'] });
      toast.success('Account deleted');
    },
  });

  const openCreateDialog = () => {
    setEditingAccount(null);
    setFormData({ currency: 'USD', id_payeer: '', account_number: '', account_name: '', active: true });
    setDialogOpen(true);
  };

  const openEditDialog = (account) => {
    setEditingAccount(account);
    setFormData({
      currency: account.currency,
      id_payeer: account.id_payeer || '',
      account_number: account.account_number,
      account_name: account.account_name || '',
      active: account.active !== false
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAccount(null);
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
              <Button onClick={openCreateDialog} className="bg-[#f5a623] hover:bg-[#e09000] text-white">
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
                <TableHead className="text-[#1e3a5f] font-semibold">Account Name</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Currency</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Payeer ID</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Account Number</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">Loading...</TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">No accounts found</TableCell>
                </TableRow>
              ) : accounts.map((account) => (
                <TableRow key={account.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="text-[#1e3a5f] font-medium">{account.account_name || '-'}</TableCell>
                  <TableCell>
                    <Badge className="bg-[#f5a623] text-white">{account.currency}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono">{account.id_payeer || '-'}</TableCell>
                  <TableCell className="text-[#1e3a5f] font-mono">{account.account_number}</TableCell>
                  <TableCell>
                    <Badge className={account.active !== false ? 'bg-emerald-600' : 'bg-slate-400'}>
                      {account.active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(account)}
                        className="text-[#1e3a5f] hover:text-[#152a45] hover:bg-slate-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(account.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-slate-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">{editingAccount ? 'Edit Account' : 'Add Payeer Account'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Account Name</Label>
              <Input
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="e.g. Main USD Account"
                className="bg-white border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Currency *</Label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-10 px-3 rounded bg-white border border-slate-300 text-slate-800"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Payeer ID</Label>
              <Input
                value={formData.id_payeer}
                onChange={(e) => setFormData({ ...formData, id_payeer: e.target.value })}
                placeholder="Payeer ID"
                className="bg-white border-slate-300"
              />
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
            <div className="flex items-center justify-between">
              <Label className="text-slate-700">Active</Label>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="border-slate-300 text-slate-600">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#152a45]">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}