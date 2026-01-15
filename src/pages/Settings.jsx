import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Globe, Database, Download, LogOut, Check, 
  Loader2, ChevronRight, Cloud, Wifi, WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { t, language, changeLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: farms = [] } = useQuery({
    queryKey: ['farms'],
    queryFn: () => base44.entities.Farm.list()
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => base44.entities.Block.list()
  });

  const { data: trees = [] } = useQuery({
    queryKey: ['trees'],
    queryFn: () => base44.entities.Tree.list()
  });

  const { data: harvestRecords = [] } = useQuery({
    queryKey: ['allHarvestRecords'],
    queryFn: () => base44.entities.HarvestRecord.list()
  });

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  const exportToCSV = async (type) => {
    let data = [];
    let filename = '';
    let headers = [];

    switch (type) {
      case 'trees':
        data = trees;
        filename = 'trees_export.csv';
        headers = ['Tree Code', 'Variety', 'Status', 'Planting Date', 'Block'];
        break;
      case 'harvest':
        data = harvestRecords;
        filename = 'harvest_export.csv';
        headers = ['Date', 'Tree ID', 'Stage', 'Fruit Count', 'Weight (kg)', 'Revenue'];
        break;
      case 'farm':
        data = farms;
        filename = 'farm_summary.csv';
        headers = ['Name', 'Village', 'District', 'Province', 'Elevation'];
        break;
    }

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
      let row = [];
      switch (type) {
        case 'trees':
          row = [
            item.tree_code,
            item.variety,
            item.status,
            item.planting_date || '',
            blocks.find(b => b.id === item.block_id)?.name || ''
          ];
          break;
        case 'harvest':
          row = [
            item.record_date,
            trees.find(t => t.id === item.tree_id)?.tree_code || item.tree_id,
            item.stage,
            item.harvested_fruit_count || '',
            item.total_weight_kg || '',
            item.total_revenue || ''
          ];
          break;
        case 'farm':
          row = [
            item.name,
            item.village || '',
            item.district || '',
            item.province || '',
            item.elevation || ''
          ];
          break;
      }
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold text-slate-900">{t('settings')}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Sync Status */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Wifi className="w-5 h-5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-50 rounded-lg">
                    <WifiOff className="w-5 h-5 text-red-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-900">{t('syncStatus')}</p>
                  <p className="text-sm text-slate-500">
                    {isOnline ? t('synced') : 'Offline - changes will sync when online'}
                  </p>
                </div>
              </div>
              <div className={cn(
                "w-3 h-3 rounded-full",
                isOnline ? "bg-emerald-500" : "bg-red-500"
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={cn(
                  "w-full p-3 rounded-xl flex items-center justify-between transition-all",
                  language === 'en' 
                    ? "bg-emerald-50 border-2 border-emerald-500" 
                    : "bg-slate-50 border-2 border-transparent"
                )}
              >
                <span className="font-medium">{t('english')}</span>
                {language === 'en' && <Check className="w-5 h-5 text-emerald-600" />}
              </button>
              <button
                onClick={() => handleLanguageChange('id')}
                className={cn(
                  "w-full p-3 rounded-xl flex items-center justify-between transition-all",
                  language === 'id' 
                    ? "bg-emerald-50 border-2 border-emerald-500" 
                    : "bg-slate-50 border-2 border-transparent"
                )}
              >
                <span className="font-medium">{t('indonesian')}</span>
                {language === 'id' && <Check className="w-5 h-5 text-emerald-600" />}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Data Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">{farms.length}</p>
                <p className="text-xs text-slate-500">Farms</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">{blocks.length}</p>
                <p className="text-xs text-slate-500">Blocks</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">{trees.length}</p>
                <p className="text-xs text-slate-500">Trees</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">{harvestRecords.length}</p>
                <p className="text-xs text-slate-500">Harvests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Download className="w-4 h-4" />
              {t('exportData')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => exportToCSV('trees')}
            >
              Export Trees (CSV)
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => exportToCSV('harvest')}
            >
              Export Harvest Data (CSV)
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => exportToCSV('farm')}
            >
              Export Farm Summary (CSV)
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-xs text-slate-400 pt-4">
          <p>Durian Growth Monitor v1.0</p>
          <p className="mt-1">© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}