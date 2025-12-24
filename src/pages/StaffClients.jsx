import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function StaffClients() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    status: true,
    role: 'USER',
    client_name: '',
    client_reg_country: '',
    client_mail: ''
  });

  const queryClient = useQueryClient();

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const clients = allUsers.filter(u => u.role === 'USER');

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingClient) {
        return apiClient.updateUser(editingClient.user_id, data);
      }
      // Используем новый эндпоинт /api/v1/clients для создания
      const clientData = {
        username: data.username,
        password: data.password,
        is_active: data.status,
        client_name: data.client_name || null,
        client_reg_country: data.client_reg_country || null,
        client_mail: data.client_mail || null
      };
      return apiClient.createClient(clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(editingClient ? 'Client updated' : 'Client created');
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update client status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Client deleted');
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete client');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (client) => apiClient.updateUser(client.user_id, { ...client, status: !client.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Client status updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update client status');
    },
  });

  const openCreateDialog = () => {
    setSearch('');
    setEditingClient(null);
    setFormData({ 
      username: '', 
      password: '', 
      status: true, 
      role: 'USER',
      client_name: '',
      client_reg_country: '',
      client_mail: ''
    });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openEditDialog = (client) => {
    setSearch('');
    setEditingClient(client);
    setFormData({
      username: client.username,
      password: '',
      status: client.status,
      role: client.role,
      client_name: '',
      client_reg_country: '',
      client_mail: ''
    });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = () => {
    if (!formData.username || (!editingClient && !formData.password)) {
      toast.error('Please fill all required fields');
      return;
    }
    const dataToSend = { ...formData };
    if (editingClient && !dataToSend.password) {
      delete dataToSend.password;
    }
    saveMutation.mutate(dataToSend);
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
    c.username?.toLowerCase().includes(search.toLowerCase())
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
                <Button variant="outline" size="sm" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
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
              id="client-search"
              name="client-search-field"
              type="search"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold">ID</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Username</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-8">No clients found</TableCell>
                </TableRow>
              ) : filteredClients.map((client) => (
                <TableRow key={client.user_id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="text-[#1e3a5f] font-mono">{client.user_id}</TableCell>
                  <TableCell className="text-[#1e3a5f] font-medium">{client.username}</TableCell>
                  <TableCell>
                    <Badge className={client.status ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'}>
                      {client.status ? 'Active' : 'Inactive'}
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
                        className={client.status ? 'text-[#f5a623] hover:text-[#e09000] hover:bg-slate-100' : 'text-emerald-600 hover:text-emerald-700 hover:bg-slate-100'}
                        title={client.status ? 'Deactivate' : 'Activate'}
                      >
                        {client.status ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
            <div className="space-y-2">
              <Label className="text-slate-700">Username *</Label>
              <Input
                id="client-username"
                name="client-username-field"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username"
                className="bg-white border-slate-300"
                disabled={!!editingClient}
                autoComplete="nope"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">{editingClient ? 'New Password (leave empty to keep current)' : 'Password *'}</Label>
              <div className="relative">
                <Input
                  id="client-password"
                  name="client-password-field"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="bg-white border-slate-300 pr-20"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
                className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-slate-100 mt-2"
              >
                <Key className="w-3.5 h-3.5 mr-2" />
                Generate Password
              </Button>
            </div>

            {!editingClient && (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-700">Client Name</Label>
                  <Input
                    id="client-name"
                    name="client-name-field"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Jack"
                    className="bg-white border-slate-300"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">Registration Country</Label>
                  <Input
                    id="client-reg-country"
                    name="client-reg-country-field"
                    value={formData.client_reg_country}
                    onChange={(e) => setFormData({ ...formData, client_reg_country: e.target.value })}
                    placeholder="ID"
                    className="bg-white border-slate-300"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">Email</Label>
                  <Input
                    id="client-mail"
                    name="client-mail-field"
                    type="email"
                    value={formData.client_mail}
                    onChange={(e) => setFormData({ ...formData, client_mail: e.target.value })}
                    placeholder="u@m.com"
                    className="bg-white border-slate-300"
                    autoComplete="off"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.status}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
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
              Are you sure you want to delete client "{clientToDelete?.username}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 text-slate-600 hover:bg-slate-100">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(clientToDelete?.user_id)}
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