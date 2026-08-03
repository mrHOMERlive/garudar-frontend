import React, { useMemo, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Globe, Search, Eye, EyeOff, RefreshCw, KeyRound } from 'lucide-react';

import { t } from '@/components/utils/language';
import { useAuth } from '@/hooks/useAuth';

// Роли, которые можно выдать через эту страницу. Клиентские аккаунты (USER)
// заводятся своим флоу с привязкой к записи Client, поэтому здесь их нет.
const INTERNAL_ROLES = ['ADMIN', 'AML_OPERATOR', 'OPS_ADMIN', 'STAFF', 'KYC_OPERATOR'];

const ROLE_BADGE = {
  ADMIN: 'bg-[#1e3a5f]',
  AML_OPERATOR: 'bg-emerald-600',
  OPS_ADMIN: 'bg-[#f5a623]',
  STAFF: 'bg-indigo-600',
  KYC_OPERATOR: 'bg-slate-600',
};

function RoleBadge({ role }) {
  return <Badge className={`${ROLE_BADGE[role] || 'bg-slate-400'} text-white`}>{role || '—'}</Badge>;
}

const EMPTY_FORM = { username: '', email: '', password: '', role: 'AML_OPERATOR', active: true };

export default function StaffUsers() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('internal');
  // Пароль существующего пользователя меняется ОТДЕЛЬНЫМ действием, а не полем
  // общей формы: так пустая строка не может попасть в payload и обнулить пароль.
  const [newPassword, setNewPassword] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter === 'internal' && !INTERNAL_ROLES.includes(u.role)) return false;
      if (roleFilter !== 'internal' && roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return `${u.username || ''} ${u.email || ''}`.toLowerCase().includes(q);
    });
  }, [users, search, roleFilter]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setNewPassword('');
    setShowPassword(false);
  };

  const openCreateDrawer = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setNewPassword('');
    setDrawerOpen(true);
  };

  const openEditDrawer = (u) => {
    setEditingUser(u);
    setFormData({
      username: u.username || '',
      email: u.email || '',
      password: '',
      role: u.role || '',
      active: u.status !== false,
    });
    setNewPassword('');
    setDrawerOpen(true);
  };

  const generatePassword = (setter) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setter(password);
    setShowPassword(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingUser) {
        // Пароль сюда НЕ попадает — он меняется отдельной мутацией.
        return apiClient.updateUser(editingUser.user_id, {
          username: formData.username.trim(),
          email: formData.email.trim() || null,
          role: formData.role,
          status: formData.active,
        });
      }
      return apiClient.createUser({
        username: formData.username.trim(),
        email: formData.email.trim() || null,
        password: formData.password,
        role: formData.role,
        status: formData.active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(editingUser ? t('usrUpdated') : t('usrCreated'));
      closeDrawer();
    },
    onError: (error) => toast.error(error?.message || t('usrSaveFailed')),
  });

  const passwordMutation = useMutation({
    mutationFn: () => apiClient.updateUser(editingUser.user_id, { password: newPassword }),
    onSuccess: () => {
      toast.success(t('usrPasswordChanged'));
      setNewPassword('');
      setShowPassword(false);
    },
    onError: (error) => toast.error(error?.message || t('usrSaveFailed')),
  });

  const handleSubmit = () => {
    if (!formData.username.trim()) {
      toast.error(t('usrUsernameRequired'));
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error(t('usrPasswordRequired'));
      return;
    }
    if (!formData.role) {
      toast.error(t('usrRoleRequired'));
      return;
    }
    saveMutation.mutate();
  };

  const isSelf = editingUser && currentUser && editingUser.user_id === currentUser.user_id;
  // У 400+ клиентских аккаунтов роль USER — её нет в списке выдаваемых.
  // Показываем как есть, но не подменяем молча при сохранении.
  const roleOutsideInternal = formData.role && !INTERNAL_ROLES.includes(formData.role);

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
                <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{t('payeerGTransStaff')}</h1>
                <span className="text-white/60">•</span>
                <span className="text-white">{t('usrPageTitle')}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('GTrans')}>
                <Button variant="outline" size="sm" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-1" />
                  {t('publicSite')}
                </Button>
              </Link>
              <Button
                onClick={openCreateDrawer}
                className="bg-[#f5a623] hover:bg-[#e09000] text-white"
                data-testid="users-add-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('usrAddUser')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder={t('usrSearchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-52 bg-white border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">{t('usrFilterInternal')}</SelectItem>
              <SelectItem value="all">{t('usrFilterAll')}</SelectItem>
              {INTERNAL_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
              <SelectItem value="USER">USER</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-500">
            {filtered.length} {t('usrResultsSuffix')}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold">{t('usrUsernameHeader')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">{t('usrEmailHeader')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-44">{t('usrRoleHeader')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-28">{t('usrStatusHeader')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-32">{t('usrCreatedHeader')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    {t('loading')}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    {t('usrNoUsersFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow
                    key={u.user_id}
                    className="border-slate-200 hover:bg-slate-100 cursor-pointer"
                    onClick={() => openEditDrawer(u)}
                    data-testid={`users-row-${u.username}`}
                  >
                    <TableCell className="text-[#1e3a5f] font-medium">{u.username}</TableCell>
                    <TableCell className="text-slate-600">{u.email || '—'}</TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <Badge className={u.status !== false ? 'bg-emerald-600' : 'bg-slate-400'}>
                        {u.status !== false ? t('usrStatusActive') : t('usrStatusBlocked')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Sheet open={drawerOpen} onOpenChange={(open) => (open ? setDrawerOpen(true) : closeDrawer())}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-[#1e3a5f]">{editingUser ? t('usrEditTitle') : t('usrCreateTitle')}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700">{t('usrUsernameHeader')} *</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-white border-slate-300"
                data-testid="users-username-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">{t('usrEmailHeader')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white border-slate-300"
              />
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label className="text-slate-700">{t('usrPasswordLabel')} *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-white border-slate-300 pr-10"
                      data-testid="users-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => generatePassword((p) => setFormData((f) => ({ ...f, password: p })))}
                    className="border-slate-300 text-slate-600"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">{t('usrPasswordHint')}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-700">{t('usrRoleHeader')} *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger className="bg-white border-slate-300" data-testid="users-role-select">
                  <SelectValue placeholder={t('usrRoleHeader')} />
                </SelectTrigger>
                <SelectContent>
                  {roleOutsideInternal && (
                    <SelectItem value={formData.role} disabled>
                      {formData.role} — {t('usrRoleExternalNote')}
                    </SelectItem>
                  )}
                  {INTERNAL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <Label className="text-slate-700">{t('usrActiveLabel')}</Label>
                <p className="text-xs text-slate-500">{t('usrActiveHint')}</p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(v) => setFormData({ ...formData, active: v })}
                disabled={isSelf}
                data-testid="users-active-switch"
              />
            </div>

            {isSelf && <p className="text-xs text-amber-700">{t('usrSelfEditNote')}</p>}

            {editingUser && (
              <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                <Label className="text-slate-700 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> {t('usrResetPasswordTitle')}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('usrNewPasswordPlaceholder')}
                      className="bg-white border-slate-300 pr-10"
                      data-testid="users-newpassword-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => generatePassword(setNewPassword)}
                    className="border-slate-300 text-slate-600"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => passwordMutation.mutate()}
                    disabled={!newPassword || passwordMutation.isPending}
                    className="bg-[#1e3a5f] hover:bg-[#152a45]"
                    data-testid="users-setpassword-btn"
                  >
                    {t('usrSetPasswordBtn')}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">{t('usrResetPasswordHint')}</p>
              </div>
            )}
          </div>

          <SheetFooter className="border-t border-slate-200 pt-4">
            <Button variant="outline" onClick={closeDrawer} className="border-slate-300 text-slate-600">
              {t('payeerCancelBtn')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
              data-testid="users-save-btn"
            >
              {saveMutation.isPending ? t('payeerSavingDots') : t('payeerSaveBtn')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
