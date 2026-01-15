import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, TreeDeciduous, MapPin, Calendar, Ruler, 
  TrendingUp, Droplets, Bug, Apple, Loader2, Edit
} from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInMonths } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import FloatingActionButton from '../components/ui/FloatingActionButton';
import GrowthForm from '../components/forms/GrowthForm';
import FertilizerForm from '../components/forms/FertilizerForm';
import IrrigationForm from '../components/forms/IrrigationForm';
import PestForm from '../components/forms/PestForm';
import HarvestForm from '../components/forms/HarvestForm';

const STATUS_COLORS = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Sick: "bg-amber-100 text-amber-700 border-amber-200",
  Dead: "bg-red-100 text-red-700 border-red-200",
  Removed: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function TreeProfile() {
  const { t } = useLanguage();
  const [activeForm, setActiveForm] = useState(null);
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const treeId = urlParams.get('id');

  const { data: tree, isLoading } = useQuery({
    queryKey: ['tree', treeId],
    queryFn: async () => {
      const trees = await base44.entities.Tree.filter({ id: treeId });
      return trees[0];
    },
    enabled: !!treeId
  });

  const { data: farm } = useQuery({
    queryKey: ['farm', tree?.farm_id],
    queryFn: async () => {
      const farms = await base44.entities.Farm.filter({ id: tree.farm_id });
      return farms[0];
    },
    enabled: !!tree?.farm_id
  });

  const { data: block } = useQuery({
    queryKey: ['block', tree?.block_id],
    queryFn: async () => {
      const blocks = await base44.entities.Block.filter({ id: tree.block_id });
      return blocks[0];
    },
    enabled: !!tree?.block_id
  });

  const { data: growthRecords = [], refetch: refetchGrowth } = useQuery({
    queryKey: ['growthRecords', treeId],
    queryFn: () => base44.entities.GrowthRecord.filter({ tree_id: treeId }, 'record_date'),
    enabled: !!treeId
  });

  const { data: fertilizerRecords = [], refetch: refetchFertilizer } = useQuery({
    queryKey: ['fertilizerRecords', treeId],
    queryFn: () => base44.entities.FertilizerRecord.filter({ tree_id: treeId }, '-record_date'),
    enabled: !!treeId
  });

  const { data: irrigationRecords = [] } = useQuery({
    queryKey: ['irrigationRecords', treeId],
    queryFn: () => base44.entities.IrrigationRecord.filter({ tree_id: treeId }, '-record_date'),
    enabled: !!treeId
  });

  const { data: pestRecords = [], refetch: refetchPest } = useQuery({
    queryKey: ['pestRecords', treeId],
    queryFn: () => base44.entities.PestRecord.filter({ tree_id: treeId }, '-record_date'),
    enabled: !!treeId
  });

  const { data: harvestRecords = [], refetch: refetchHarvest } = useQuery({
    queryKey: ['harvestRecords', treeId],
    queryFn: () => base44.entities.HarvestRecord.filter({ tree_id: treeId }, '-record_date'),
    enabled: !!treeId
  });

  const getAge = () => {
    if (!tree?.planting_date) return null;
    const months = differenceInMonths(new Date(), new Date(tree.planting_date));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0) {
      return `${years} ${t('years')} ${remainingMonths} ${t('months')}`;
    }
    return `${months} ${t('months')}`;
  };

  const latestGrowth = growthRecords[growthRecords.length - 1];
  const latestFertilizer = fertilizerRecords[0];
  const latestIrrigation = irrigationRecords[0];

  const handleFormSave = () => {
    setActiveForm(null);
    refetchGrowth();
    refetchFertilizer();
    refetchPest();
    refetchHarvest();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Tree not found</p>
      </div>
    );
  }

  const variety = tree.variety === 'Other' ? tree.variety_other : tree.variety;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Trees')}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{tree.tree_code}</h1>
              <Badge variant="outline" className={cn("text-xs border-white/50 text-white bg-white/20")}>
                {t(tree.status?.toLowerCase())}
              </Badge>
            </div>
            <p className="text-emerald-100 text-sm">{variety}</p>
          </div>
          <Link to={createPageUrl(`EditTree?id=${tree.id}`)}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Edit className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="px-4 -mt-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t('age')}</p>
                  <p className="text-sm font-medium">{getAge() || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t('block')}</p>
                  <p className="text-sm font-medium">{block?.name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Ruler className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t('spacing')}</p>
                  <p className="text-sm font-medium">
                    {tree.row_spacing && tree.tree_spacing 
                      ? `${tree.row_spacing}m × ${tree.tree_spacing}m` 
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t('currentStage')}</p>
                  <p className="text-sm font-medium">{latestGrowth?.growth_stage || '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="text-xs rounded-lg">{t('overview')}</TabsTrigger>
            <TabsTrigger value="growth" className="text-xs rounded-lg">{t('growth')}</TabsTrigger>
            <TabsTrigger value="fertilizer" className="text-xs rounded-lg">{t('fertilizer')}</TabsTrigger>
            <TabsTrigger value="pest" className="text-xs rounded-lg">{t('pestDisease')}</TabsTrigger>
            <TabsTrigger value="harvest" className="text-xs rounded-lg">{t('harvestHistory')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Latest Records Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{t('lastGrowth')}</CardTitle>
              </CardHeader>
              <CardContent>
                {latestGrowth ? (
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{latestGrowth.height_m || '-'}</p>
                      <p className="text-xs text-slate-500">{t('height')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{latestGrowth.trunk_diameter_cm || '-'}</p>
                      <p className="text-xs text-slate-500">{t('trunkDiameter')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{latestGrowth.canopy_diameter_m || '-'}</p>
                      <p className="text-xs text-slate-500">{t('canopyDiameter')}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-2">No records</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{t('lastFertilizer')}</CardTitle>
              </CardHeader>
              <CardContent>
                {latestFertilizer ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{latestFertilizer.fertilizer_type}</p>
                      <p className="text-sm text-slate-500">
                        {latestFertilizer.amount_per_tree} {latestFertilizer.amount_unit} • {latestFertilizer.method}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {format(new Date(latestFertilizer.record_date), 'MMM d')}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-2">No records</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{t('lastIrrigation')}</CardTitle>
              </CardHeader>
              <CardContent>
                {latestIrrigation ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{latestIrrigation.irrigation_method}</p>
                      <p className="text-sm text-slate-500">
                        {latestIrrigation.duration_minutes}min • {latestIrrigation.weather}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {format(new Date(latestIrrigation.record_date), 'MMM d')}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-2">No records</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="mt-4 space-y-4">
            {growthRecords.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{t('height')} (m)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthRecords}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="record_date" 
                          tickFormatter={(d) => format(new Date(d), 'MMM yy')}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip 
                          labelFormatter={(d) => format(new Date(d), 'MMM d, yyyy')}
                          formatter={(v) => [v + 'm', 'Height']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="height_m" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {growthRecords.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{t('trunkDiameter')} (cm)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthRecords}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="record_date" 
                          tickFormatter={(d) => format(new Date(d), 'MMM yy')}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip 
                          labelFormatter={(d) => format(new Date(d), 'MMM d, yyyy')}
                          formatter={(v) => [v + 'cm', 'Diameter']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="trunk_diameter_cm" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {growthRecords.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-slate-300" />
                <p className="mt-2 text-slate-500">No growth records yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="fertilizer" className="mt-4 space-y-3">
            {fertilizerRecords.length > 0 ? (
              fertilizerRecords.map(record => (
                <Card key={record.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{record.fertilizer_type}</p>
                        <p className="text-sm text-slate-500">
                          {record.amount_per_tree} {record.amount_unit} • {record.method}
                        </p>
                        {record.soil_ph && (
                          <p className="text-xs text-slate-400 mt-1">pH: {record.soil_ph}</p>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {format(new Date(record.record_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Droplets className="w-12 h-12 mx-auto text-slate-300" />
                <p className="mt-2 text-slate-500">No fertilizer records yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pest" className="mt-4 space-y-3">
            {pestRecords.length > 0 ? (
              pestRecords.map(record => (
                <Card key={record.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {record.pest_type === 'Other' ? record.pest_other : record.pest_type}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              record.severity === 'High' ? "border-red-500 text-red-700" :
                              record.severity === 'Medium' ? "border-amber-500 text-amber-700" :
                              "border-emerald-500 text-emerald-700"
                            )}
                          >
                            {record.severity}
                          </Badge>
                        </div>
                        {record.treatment_product && (
                          <p className="text-sm text-slate-500 mt-1">
                            Treatment: {record.treatment_product}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {format(new Date(record.record_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    {record.photos?.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {record.photos.map((url, i) => (
                          <img 
                            key={i} 
                            src={url} 
                            alt="" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Bug className="w-12 h-12 mx-auto text-slate-300" />
                <p className="mt-2 text-slate-500">No pest records yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="harvest" className="mt-4 space-y-3">
            {harvestRecords.length > 0 ? (
              harvestRecords.map(record => (
                <Card key={record.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="text-xs mb-1">
                          {record.stage}
                        </Badge>
                        <div className="flex items-center gap-4 mt-2">
                          {record.harvested_fruit_count && (
                            <div>
                              <p className="text-lg font-bold text-emerald-600">{record.harvested_fruit_count}</p>
                              <p className="text-xs text-slate-500">fruits</p>
                            </div>
                          )}
                          {record.total_weight_kg && (
                            <div>
                              <p className="text-lg font-bold text-blue-600">{record.total_weight_kg}</p>
                              <p className="text-xs text-slate-500">kg</p>
                            </div>
                          )}
                          {record.total_revenue && (
                            <div>
                              <p className="text-lg font-bold text-purple-600">${record.total_revenue}</p>
                              <p className="text-xs text-slate-500">revenue</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {format(new Date(record.record_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Apple className="w-12 h-12 mx-auto text-slate-300" />
                <p className="mt-2 text-slate-500">No harvest records yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onSelect={setActiveForm} />

      {/* Form Modals */}
      {activeForm === 'growth' && (
        <GrowthForm tree={tree} onClose={() => setActiveForm(null)} onSave={handleFormSave} />
      )}
      {activeForm === 'fertilizer' && (
        <FertilizerForm tree={tree} farm={farm} onClose={() => setActiveForm(null)} onSave={handleFormSave} />
      )}
      {activeForm === 'irrigation' && (
        <IrrigationForm tree={tree} farm={farm} onClose={() => setActiveForm(null)} onSave={handleFormSave} />
      )}
      {activeForm === 'pest' && (
        <PestForm tree={tree} farm={farm} onClose={() => setActiveForm(null)} onSave={handleFormSave} />
      )}
      {activeForm === 'harvest' && (
        <HarvestForm tree={tree} farm={farm} onClose={() => setActiveForm(null)} onSave={handleFormSave} />
      )}
    </div>
  );
}