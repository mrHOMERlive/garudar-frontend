import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, UserX, UserCheck, Search, Eye, EyeOff, Key, Globe, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import moment from 'moment';

import CountrySelector from '../components/kyc/CountrySelector';

export default function StaffClients() {
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    client_alias_1: '',
    client_alias_2: '',
    client_alias_3: '',
    client_reg_number: '',
    client_tax_number: '',
    client_reg_country: '',
    doc_id: '',
    status_sign: 'not_sent',
    date_signing: '',
    group_id: '',
    group_name: '',
    client_director: '',
    last_id: '',
    description: '',
    email: '',
    login: '',
    password: '',
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

  const { data: rawClients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const data = await apiClient.getAllClients();
      return data.map(client => ({
        client_id: client.client_id,
        user_id: client.user_id,
        name: client.client_name || '',
        client_alias_1: client.client_alias_1 || '',
        client_alias_2: client.client_alias_2 || '',
        client_alias_3: client.client_alias_3 || '',
        client_reg_number: client.client_reg_number || '',
        client_tax_number: client.client_tax_number || '',
        client_reg_country: client.client_reg_country || '',
        doc_id: client.doc_id || '',
        status_sign: client.status_sign?.toLowerCase() || 'not_sent',
        date_signing: client.date_signing || '',
        group_id: client.group_id || '',
        group_name: client.group_name || '',
        client_director: client.client_director || '',
        last_id: client.last_id || '',
        description: '',
        email: client.client_mail || '',
        login: client.username || '',
        password: '',
        active: client.is_active ?? true,
        kyc_status: client.kyc_status || '',
        created_date: client.kyc_submitted_at || new Date().toISOString()
      }));
    },
  });

  const clients = rawClients;

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const apiData = {
        client_name: data.name,
        client_alias_1: data.client_alias_1 || null,
        client_alias_2: data.client_alias_2 || null,
        client_alias_3: data.client_alias_3 || null,
        client_reg_number: data.client_reg_number || null,
        client_tax_number: data.client_tax_number || null,
        client_reg_country: data.client_reg_country || null,
        client_director: data.client_director || null,
        client_mail: data.email,
        doc_id: data.doc_id || null,
        status_sign: data.status_sign?.toLowerCase() || 'not_sent',
        date_signing: data.date_signing || null,
        group_id: data.group_id || null,
        group_name: data.group_name || null,
        description: data.description || null,
        is_active: data.active
      };

      if (editingClient) {
        if (data.login) apiData.username = data.login;
        if (data.password) apiData.password = data.password;
        return apiClient.updateClient(editingClient.client_id, apiData);
      } else {
        const createData = {
          username: data.login,
          password: data.password,
          ...apiData
        };
        return apiClient.createClient(createData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(editingClient ? 'Client updated' : 'Client created');
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted');
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (client) => apiClient.updateClient(client.client_id, { is_active: !client.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client status updated');
    },
  });

  const openCreateDialog = () => {
    setEditingClient(null);
    setFormData({
      client_id: '',
      name: '',
      client_alias_1: '',
      client_alias_2: '',
      client_alias_3: '',
      client_reg_number: '',
      client_tax_number: '',
      client_reg_country: '',
      doc_id: '',
      status_sign: 'not_sent',
      date_signing: '',
      group_id: '',
      group_name: '',
      client_director: '',
      last_id: '',
      description: '',
      email: '',
      login: '',
      password: '',
      active: true
    });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openEditDialog = (client) => {
    setEditingClient(client);
    setFormData({
      client_id: client.client_id,
      name: client.name,
      client_alias_1: client.client_alias_1 || '',
      client_alias_2: client.client_alias_2 || '',
      client_alias_3: client.client_alias_3 || '',
      client_reg_number: client.client_reg_number || '',
      client_tax_number: client.client_tax_number || '',
      client_reg_country: client.client_reg_country || '',
      doc_id: client.doc_id || '',
      status_sign: client.status_sign || 'not_sent',
      date_signing: client.date_signing || '',
      group_id: client.group_id || '',
      group_name: client.group_name || '',
      client_director: client.client_director || '',
      last_id: client.last_id || '',
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
    if (!formData.name || !formData.email) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!editingClient && (!formData.login || !formData.password)) {
      toast.error('Username and password are required for new clients');
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

  const sortedClients = [...filteredClients].sort((a, b) => {
    const idA = a.client_id || '';
    const idB = b.client_id || '';
    return sortOrder === 'desc' ? idB.localeCompare(idA) : idA.localeCompare(idB);
  });

  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = sortedClients.slice(startIndex, startIndex + itemsPerPage);

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
                <TableHead className="text-[#1e3a5f] font-semibold w-32">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 hover:text-[#152a45]"
                  >
                    Client ID
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Name</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-36">Sign Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-36">Account Status</TableHead>
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
              ) : paginatedClients.map((client) => (
                <TableRow
                  key={client.client_id}
                  className="border-slate-200 hover:bg-slate-100 cursor-pointer"
                  onClick={() => openEditDialog(client)}
                >
                  <TableCell className="text-[#1e3a5f] font-mono">{client.client_id}</TableCell>
                  <TableCell className="text-[#1e3a5f] font-medium">
                    <div>{client.name}</div>
                    {client.client_alias_1 && <div className="text-slate-500 text-sm">{client.client_alias_1}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      client.status_sign === 'signed' ? 'bg-emerald-600 text-white' :
                        client.status_sign === 'sent' ? 'bg-amber-500 text-white' :
                          'bg-slate-400 text-white'
                    }>
                      {client.status_sign === 'signed' ? 'Signed' : client.status_sign === 'sent' ? 'Sent' : 'Not Sent'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={client.active ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'}>
                      {client.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20 bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedClients.length)} of {sortedClients.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#1e3a5f] border-b border-slate-200 pb-2">Client Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {editingClient && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs">Client ID *</Label>
                    <Input
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      placeholder="e.g., CL1"
                      className="bg-white border-slate-300 text-sm"
                      disabled={true}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Client Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Client name"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Alias 1</Label>
                  <Input
                    value={formData.client_alias_1}
                    onChange={(e) => setFormData({ ...formData, client_alias_1: e.target.value })}
                    placeholder="Alternative name 1"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Alias 2</Label>
                  <Input
                    value={formData.client_alias_2}
                    onChange={(e) => setFormData({ ...formData, client_alias_2: e.target.value })}
                    placeholder="Alternative name 2"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Alias 3</Label>
                  <Input
                    value={formData.client_alias_3}
                    onChange={(e) => setFormData({ ...formData, client_alias_3: e.target.value })}
                    placeholder="Alternative name 3"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Registration Number</Label>
                  <Input
                    value={formData.client_reg_number}
                    onChange={(e) => setFormData({ ...formData, client_reg_number: e.target.value })}
                    placeholder="Registration no."
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Tax Number</Label>
                  <Input
                    value={formData.client_tax_number}
                    onChange={(e) => setFormData({ ...formData, client_tax_number: e.target.value })}
                    placeholder="Tax ID"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Registration Country</Label>
                  <CountrySelector
                    value={formData.client_reg_country}
                    onChange={(value) => setFormData({ ...formData, client_reg_country: value })}
                    language="en"
                    countries={countries}
                    saveName={true}
                    placeholder="Select country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Director Name</Label>
                  <Input
                    value={formData.client_director}
                    onChange={(e) => setFormData({ ...formData, client_director: e.target.value })}
                    placeholder="Director name"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Document Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#1e3a5f] border-b border-slate-200 pb-2">Document & Signing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Document ID</Label>
                  <Input
                    value={formData.doc_id}
                    onChange={(e) => setFormData({ ...formData, doc_id: e.target.value })}
                    placeholder="e.g., AGG/1/20261201"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Signing Status</Label>
                  <Select value={formData.status_sign} onValueChange={(value) => setFormData({ ...formData, status_sign: value })}>
                    <SelectTrigger className="bg-white border-slate-300 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_sent">Not Sent</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="signed">Signed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Date of Signing</Label>
                  <Input
                    type="date"
                    value={formData.date_signing}
                    onChange={(e) => setFormData({ ...formData, date_signing: e.target.value })}
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Group Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#1e3a5f] border-b border-slate-200 pb-2">Group & Reference</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Group ID</Label>
                  <Input
                    value={formData.group_id}
                    onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                    placeholder="e.g., 1"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Group Name</Label>
                  <Input
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    placeholder="e.g., Garuda"
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Authorization Credentials */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-[#1e3a5f] text-sm font-semibold">
                <Key className="w-4 h-4" />
                Authorization Credentials
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Login *</Label>
                  <Input
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    placeholder={editingClient ? (editingClient.login || 'username') : 'username'}
                    className="bg-white border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs">Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="bg-white border-slate-300 pr-20 text-sm"
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
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePassword}
                  className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-slate-100 text-xs"
                >
                  <Key className="w-3.5 h-3.5 mr-2" />
                  Generate Password
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label className="text-slate-700 text-xs">Active</Label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-slate-700 text-xs">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes"
                className="bg-white border-slate-300 text-sm"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="border-slate-300 text-slate-600 text-sm">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#152a45] text-sm">
              {saveMutation.isPending ? 'Saving...' : 'Save Client'}
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