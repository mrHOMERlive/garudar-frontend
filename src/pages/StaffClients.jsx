import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pencil, Trash2, UserX, UserCheck, Search, Eye, EyeOff, Key, Globe } from 'lucide-react';
import moment from 'moment';

export default function StaffClients() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    description: '',
    email: '',
    login: '',
    password: '',
    active: true
  });

  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingClient) {
        return base44.entities.Client.update(editingClient.id, data);
      }
      return base44.entities.Client.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(editingClient ? 'Client updated' : 'Client created');
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted');
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (client) => base44.entities.Client.update(client.id, { active: !client.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client status updated');
    },
  });

  const openCreateDialog = () => {
    setEditingClient(null);
    setFormData({ client_id: '', name: '', description: '', email: '', login: '', password: '', active: true });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openEditDialog = (client) => {
    setEditingClient(client);
    setFormData({
      client_id: client.client_id,
      name: client.name,
      description: client.description || '',
      email: client.email,
      login: client.login || '',
      password: client.password || '',
      active: client.active
    });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = () => {
    if (!formData.client_id || !formData.name || !formData.email || !formData.login || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  const openDeleteDialog = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    setShowPassword(true);
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.client_id?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.login?.toLowerCase().includes(search.toLowerCase())
  );

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
                  <span className="text-white">Client Management</span>
                </div>
                <Badge className="bg-[#f5a623] text-white">{clients.length} clients</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('GTrans')}>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                  <Globe className="w-4 h-4 mr-1" />
                  Public Site
                </Button>
              </Link>
              <Button onClick={openCreateDialog} className="bg-[#f5a623] hover:bg-[#e09000] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold">Client ID</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Name</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Email</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Login</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Last Login</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">No clients found</TableCell>
                </TableRow>
              ) : filteredClients.map((client) => (
                <TableRow key={client.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="text-[#1e3a5f] font-mono">{client.client_id}</TableCell>
                  <TableCell className="text-[#1e3a5f] font-medium">{client.name}</TableCell>
                  <TableCell className="text-slate-700">{client.email}</TableCell>
                  <TableCell className="text-slate-700 font-mono">{client.login || '-'}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {client.last_login ? moment(client.last_login).format('DD/MM/YY HH:mm') : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge className={client.active ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'}>
                      {client.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(client)}
                        className="text-[#1e3a5f] hover:text-[#152a45] hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActiveMutation.mutate(client)}
                        className={client.active ? 'text-[#f5a623] hover:text-[#e09000] hover:bg-slate-100' : 'text-emerald-600 hover:text-emerald-700 hover:bg-slate-100'}
                        title={client.active ? 'Deactivate' : 'Activate'}
                      >
                        {client.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(client)}
                        className="text-red-500 hover:text-red-600 hover:bg-slate-100"
                        title="Delete"
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Client ID *</Label>
                <Input
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  placeholder="e.g., CLT-001"
                  className="bg-white border-slate-300"
                  disabled={!!editingClient}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Client name"
                  className="bg-white border-slate-300"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-700">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
                className="bg-white border-slate-300"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-[#1e3a5f] text-sm font-medium">
                <Key className="w-4 h-4" />
                Authorization Credentials
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Login *</Label>
                  <Input
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    placeholder="username"
                    className="bg-white border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="bg-white border-slate-300 pr-20"
                    />
                    <div className="absolute right-1 top-1 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-slate-800"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
                className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-slate-100"
              >
                <Key className="w-3.5 h-3.5 mr-2" />
                Generate Password
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="bg-white border-slate-300"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label className="text-slate-700">Active</Label>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200 text-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1e3a5f]">Delete Client</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to delete client "{clientToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 text-slate-600 hover:bg-slate-100">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(clientToDelete?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}