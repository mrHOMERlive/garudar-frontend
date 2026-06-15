import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, User } from 'lucide-react';

/**
 * Shared header for all Ops PTG pages. Mirrors the staff header styling but
 * is independent from it (the ops module is an isolated environment).
 */
export default function OpsHeader({ title, subtitle, backTo = 'OpsDashboard', showBack = true }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(createPageUrl('GTransLogin'));
  };

  return (
    <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <Link to={createPageUrl(backTo)}>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Link to={createPageUrl('OpsDashboard')} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg">
                <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">{title || 'Operations'}</h1>
                  <span className="text-xs bg-[#f5a623] px-2 py-1 rounded text-white font-medium">OPS</span>
                </div>
                {subtitle && <p className="text-slate-300 text-sm">{subtitle}</p>}
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.username}</span>
              </div>
            )}
            <Button onClick={handleLogout} className="bg-white text-[#1e3a5f] hover:bg-slate-100">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
