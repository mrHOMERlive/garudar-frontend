import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { t } from '@/components/utils/language';

/**
 * Shared compact header for client inner pages (CurrentOrders, CreateOrder,
 * OrderHistory, Executed/Cancelled/Deleted, KYC, NDA, Service Agreement).
 *
 * Mobile-first: collapses to logo + title + LanguageSwitcher + ArrowLeft.
 * Actions (right-side buttons) are hidden on xs, shown on sm+.
 *
 * For UserDashboard (the hub with Profile/Logout actions) use its own
 * inline header with hamburger Sheet.
 *
 * Props:
 *  - subtitle: string shown under "GTrans"
 *  - badgeLabel: optional small right-of-title badge (e.g. "CLIENT", "3 ACTIVE")
 *  - badgeClassName: tailwind colors for badge (default emerald)
 *  - actions: React node rendered on the right side (hidden on <sm)
 *  - sticky: apply sticky top-0 z-10 (default false)
 *  - backTo: createPageUrl key for back button (default 'UserDashboard')
 */
export default function ClientPageHeader({
  subtitle,
  badgeLabel,
  badgeClassName = 'bg-emerald-500',
  actions,
  sticky = false,
  backTo = 'UserDashboard',
}) {
  return (
    <header className={`bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg ${sticky ? 'sticky top-0 z-10' : ''}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <Link to={createPageUrl(backTo)} className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10"
                aria-label={t('backToDashboardBtn') || 'Back'}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center p-1.5 sm:p-2 shadow-lg flex-shrink-0">
              <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">GTrans</h1>
                {badgeLabel && (
                  <span
                    className={`text-[10px] sm:text-xs ${badgeClassName} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-white font-medium whitespace-nowrap`}
                  >
                    {badgeLabel}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-slate-300 text-xs sm:text-sm truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            <LanguageSwitcher variant="ghost" />
            {actions && <div className="hidden sm:flex items-center gap-2 md:gap-3">{actions}</div>}
          </div>
        </div>
      </div>
    </header>
  );
}
