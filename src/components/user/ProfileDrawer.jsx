import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { User, Mail, Shield, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/api/apiClient';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-medium text-slate-800">{value || '—'}</div>
      </div>
    </div>
  );
}

export default function ProfileDrawer({ open, onClose }) {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const changeMutation = useMutation({
    mutationFn: async () => {
      // Verify current password via login
      await apiClient.login(user.username, currentPassword);
      // Set new password
      await apiClient.updateCurrentUser({ password: newPassword });
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFieldError('');
    },
    onError: (error) => {
      const msg = error?.message || '';
      if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('invalid')) {
        setFieldError('Current password is incorrect');
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    },
  });

  const handleChangePassword = (e) => {
    e.preventDefault();
    setFieldError('');

    if (!currentPassword) {
      setFieldError('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      setFieldError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }

    changeMutation.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>My Profile</SheetTitle>
          <SheetDescription>Account information and settings</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Account Info */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Account Information</h4>
            <div className="bg-slate-50 rounded-lg px-4">
              <InfoRow icon={User} label="Username" value={user?.username} />
              <Separator className="my-0" />
              <InfoRow icon={Mail} label="Email" value={user?.email} />
              <Separator className="my-0" />
              <InfoRow icon={Shield} label="Role" value={user?.role} />
            </div>
          </div>

          <Separator />

          {/* Change Password */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Change Password
            </h4>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="current-password" className="text-xs text-slate-600">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="new-password" className="text-xs text-slate-600">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowNew((v) => !v)}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm-password" className="text-xs text-slate-600">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {fieldError && (
                <p className="text-xs text-red-600">{fieldError}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
                disabled={changeMutation.isPending}
              >
                {changeMutation.isPending ? 'Saving…' : 'Save Password'}
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
