import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { Home, TreeDeciduous, Calendar, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { page: 'Dashboard', icon: Home, label: t('dashboard') },
    { page: 'Trees', icon: TreeDeciduous, label: t('trees') },
    { page: 'Tasks', icon: Calendar, label: t('tasks') },
    { page: 'Analytics', icon: BarChart3, label: t('analytics') },
    { page: 'Settings', icon: Settings, label: t('settings') },
  ];

  const isActive = (page) => {
    const pageUrl = createPageUrl(page);
    return currentPath === pageUrl || currentPath.includes(`/${page}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 z-40 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ page, icon: Icon, label }) => (
          <Link
            key={page}
            to={createPageUrl(page)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
              isActive(page) 
                ? "text-emerald-600 bg-emerald-50" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon className={cn(
              "w-5 h-5",
              isActive(page) && "stroke-[2.5]"
            )} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function Layout({ children, currentPageName }) {
  // Pages without bottom nav
  const noNavPages = ['TreeProfile', 'AddTree', 'EditTree'];
  const showNav = !noNavPages.includes(currentPageName);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-50">
        <style>{`
          :root {
            --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
          }
          .safe-area-pb {
            padding-bottom: max(0.5rem, var(--safe-area-inset-bottom));
          }
          @media (max-width: 640px) {
            html {
              font-size: 15px;
            }
          }
        `}</style>
        
        <main className={cn(showNav && "pb-16")}>
          {children}
        </main>
        
        {showNav && <BottomNav />}
      </div>
    </LanguageProvider>
  );
}