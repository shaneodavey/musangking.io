import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Apple, TreeDeciduous } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function Analytics() {
  const { t } = useLanguage();

  const { data: trees = [], isLoading: treesLoading } = useQuery({
    queryKey: ['trees'],
    queryFn: () => base44.entities.Tree.list()
  });

  const { data: harvestRecords = [], isLoading: harvestLoading } = useQuery({
    queryKey: ['allHarvestRecords'],
    queryFn: () => base44.entities.HarvestRecord.list('record_date')
  });

  const { data: growthRecords = [] } = useQuery({
    queryKey: ['allGrowthRecords'],
    queryFn: () => base44.entities.GrowthRecord.list('record_date', 500)
  });

  // Analytics calculations
  const getYieldByVariety = () => {
    const varietyYields = {};
    
    harvestRecords.forEach(record => {
      if (record.total_weight_kg && record.tree_id) {
        const tree = trees.find(t => t.id === record.tree_id);
        if (tree) {
          const variety = tree.variety === 'Other' ? (tree.variety_other || 'Other') : tree.variety;
          if (!varietyYields[variety]) {
            varietyYields[variety] = { total: 0, count: 0 };
          }
          varietyYields[variety].total += record.total_weight_kg;
          varietyYields[variety].count++;
        }
      }
    });

    return Object.entries(varietyYields).map(([name, data]) => ({
      name,
      total: Math.round(data.total * 10) / 10,
      average: Math.round((data.total / data.count) * 10) / 10
    }));
  };

  const getYieldByYear = () => {
    const yearlyYields = {};
    
    harvestRecords.forEach(record => {
      if (record.total_weight_kg && record.stage === 'Harvest') {
        const year = new Date(record.record_date).getFullYear();
        if (!yearlyYields[year]) {
          yearlyYields[year] = 0;
        }
        yearlyYields[year] += record.total_weight_kg;
      }
    });

    return Object.entries(yearlyYields)
      .map(([year, total]) => ({
        year,
        total: Math.round(total * 10) / 10
      }))
      .sort((a, b) => a.year - b.year);
  };

  const getGrowthTrends = () => {
    const monthlyGrowth = {};
    
    growthRecords.forEach(record => {
      if (record.height_m) {
        const month = format(new Date(record.record_date), 'MMM yyyy');
        if (!monthlyGrowth[month]) {
          monthlyGrowth[month] = { heights: [], diameters: [] };
        }
        monthlyGrowth[month].heights.push(record.height_m);
        if (record.trunk_diameter_cm) {
          monthlyGrowth[month].diameters.push(record.trunk_diameter_cm);
        }
      }
    });

    return Object.entries(monthlyGrowth)
      .slice(-12)
      .map(([month, data]) => ({
        month,
        avgHeight: Math.round(data.heights.reduce((a, b) => a + b, 0) / data.heights.length * 10) / 10,
        avgDiameter: data.diameters.length > 0 
          ? Math.round(data.diameters.reduce((a, b) => a + b, 0) / data.diameters.length * 10) / 10
          : 0
      }));
  };

  const getRevenueByVariety = () => {
    const varietyRevenue = {};
    
    harvestRecords.forEach(record => {
      if (record.total_revenue && record.tree_id) {
        const tree = trees.find(t => t.id === record.tree_id);
        if (tree) {
          const variety = tree.variety === 'Other' ? (tree.variety_other || 'Other') : tree.variety;
          varietyRevenue[variety] = (varietyRevenue[variety] || 0) + record.total_revenue;
        }
      }
    });

    return Object.entries(varietyRevenue).map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: COLORS[i % COLORS.length]
    }));
  };

  const getTotalStats = () => {
    const totalYield = harvestRecords
      .filter(r => r.stage === 'Harvest')
      .reduce((sum, r) => sum + (r.total_weight_kg || 0), 0);
    
    const totalRevenue = harvestRecords
      .reduce((sum, r) => sum + (r.total_revenue || 0), 0);
    
    const avgYieldPerTree = trees.length > 0 ? totalYield / trees.length : 0;

    return {
      totalYield: Math.round(totalYield * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgYieldPerTree: Math.round(avgYieldPerTree * 10) / 10
    };
  };

  const isLoading = treesLoading || harvestLoading;
  const stats = getTotalStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold">{t('analytics')}</h1>
        <p className="text-emerald-100 mt-1">Farm performance insights</p>
      </div>

      {/* Summary Cards */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Apple className="w-5 h-5 mx-auto text-emerald-600" />
              <p className="text-lg font-bold text-slate-900 mt-1">{stats.totalYield}</p>
              <p className="text-xs text-slate-500">Total kg</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-blue-600" />
              <p className="text-lg font-bold text-slate-900 mt-1">${stats.totalRevenue}</p>
              <p className="text-xs text-slate-500">Revenue</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <TreeDeciduous className="w-5 h-5 mx-auto text-purple-600" />
              <p className="text-lg font-bold text-slate-900 mt-1">{stats.avgYieldPerTree}</p>
              <p className="text-xs text-slate-500">kg/tree</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="px-4 mt-6">
        <Tabs defaultValue="yield" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="yield" className="rounded-lg">{t('yieldAnalytics')}</TabsTrigger>
            <TabsTrigger value="growth" className="rounded-lg">{t('growthAnalytics')}</TabsTrigger>
          </TabsList>

          <TabsContent value="yield" className="mt-4 space-y-4">
            {/* Yield by Variety */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  {t('totalHarvest')} {t('perVariety')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getYieldByVariety()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Yield by Year */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  {t('totalHarvest')} {t('perYear')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getYieldByYear()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Variety */}
            {getRevenueByVariety().length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    {t('totalRevenue')} {t('perVariety')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getRevenueByVariety()}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {getRevenueByVariety().map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom"
                          formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                        />
                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="growth" className="mt-4 space-y-4">
            {/* Average Height Trend */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Average Height Trend (m)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getGrowthTrends()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="avgHeight" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                        name="Height (m)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Average Trunk Diameter Trend */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Average Trunk Diameter Trend (cm)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getGrowthTrends()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="avgDiameter" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                        name="Diameter (cm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}