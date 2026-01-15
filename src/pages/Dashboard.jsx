import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import StatCard from '../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreeDeciduous, AlertTriangle, Calendar, Leaf, ChevronRight, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import GrowthForm from '../components/forms/GrowthForm';
import FertilizerForm from '../components/forms/FertilizerForm';
import IrrigationForm from '../components/forms/IrrigationForm';
import PestForm from '../components/forms/PestForm';
import HarvestForm from '../components/forms/HarvestForm';
import TreeSelector from '../components/forms/TreeSelector';
import { cn } from "@/lib/utils";

const VARIETY_COLORS = [
  '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#f97316', '#ec4899', '#84cc16'
];

const STAGE_COLORS = {
  'Flush': '#84cc16',
  'Vegetative': '#22c55e',
  'Flower Bud': '#f59e0b',
  'Flowering': '#ec4899',
  'Fruit Set': '#8b5cf6',
  'Maturing': '#f97316',
  'Harvest': '#ef4444',
  'Rest': '#6b7280'
};

export default function Dashboard() {
  const { t } = useLanguage();
  const [activeForm, setActiveForm] = useState(null);
  const [selectedTree, setSelectedTree] = useState(null);
  const [showTreeSelector, setShowTreeSelector] = useState(false);

  const { data: farms = [] } = useQuery({
    queryKey: ['farms'],
    queryFn: () => base44.entities.Farm.list()
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => base44.entities.Block.list()
  });

  const { data: trees = [], isLoading: treesLoading } = useQuery({
    queryKey: ['trees'],
    queryFn: () => base44.entities.Tree.list()
  });

  const { data: growthRecords = [] } = useQuery({
    queryKey: ['growthRecords'],
    queryFn: () => base44.entities.GrowthRecord.list('-record_date', 100)
  });

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.TaskSchedule.filter({ status: 'Pending' }, 'due_date', 10)
  });

  const farm = farms[0];

  const activeTrees = trees.filter(t => t.status === 'Active');
  const sickTrees = trees.filter(t => t.status === 'Sick');

  const getAverageAge = () => {
    const treesWithDate = trees.filter(t => t.planting_date);
    if (treesWithDate.length === 0) return 0;
    
    const totalMonths = treesWithDate.reduce((sum, tree) => {
      const planted = new Date(tree.planting_date);
      const now = new Date();
      return sum + ((now.getFullYear() - planted.getFullYear()) * 12 + (now.getMonth() - planted.getMonth()));
    }, 0);
    
    return Math.round(totalMonths / treesWithDate.length / 12 * 10) / 10;
  };

  const varietyData = () => {
    const counts = {};
    trees.forEach(tree => {
      const variety = tree.variety === 'Other' ? (tree.variety_other || 'Other') : tree.variety;
      counts[variety] = (counts[variety] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: VARIETY_COLORS[i % VARIETY_COLORS.length]
    }));
  };

  const stageData = () => {
    const latestStages = {};
    growthRecords.forEach(record => {
      if (record.growth_stage && (!latestStages[record.tree_id] || 
          new Date(record.record_date) > new Date(latestStages[record.tree_id].date))) {
        latestStages[record.tree_id] = { stage: record.growth_stage, date: record.record_date };
      }
    });
    
    const counts = {};
    Object.values(latestStages).forEach(({ stage }) => {
      counts[stage] = (counts[stage] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STAGE_COLORS[name]
    }));
  };

  const getTaskStatus = (dueDate) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    if (isThisWeek(date)) return 'thisWeek';
    return 'later';
  };

  const handleFormOpen = (formType) => {
    setActiveForm(formType);
    setShowTreeSelector(true);
  };

  const handleTreeSelect = (tree) => {
    setSelectedTree(tree);
    setShowTreeSelector(false);
  };

  const handleFormClose = () => {
    setActiveForm(null);
    setSelectedTree(null);
    setShowTreeSelector(false);
  };

  const handleFormSave = () => {
    handleFormClose();
    refetchTasks();
  };

  if (treesLoading) {
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
        <h1 className="text-2xl font-bold">{farm?.name || 'Durian Farm'}</h1>
        <p className="text-emerald-100 mt-1">{t('farmOverview')}</p>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={TreeDeciduous}
            label={t('totalTrees')}
            value={trees.length}
            subValue={`${activeTrees.length} ${t('active')}`}
            color="emerald"
          />
          <StatCard
            icon={AlertTriangle}
            label={t('sickTrees')}
            value={sickTrees.length}
            color={sickTrees.length > 0 ? "amber" : "emerald"}
          />
          <StatCard
            icon={Calendar}
            label={t('averageAge')}
            value={`${getAverageAge()}`}
            subValue={t('years')}
            color="blue"
          />
          <StatCard
            icon={Leaf}
            label={t('activeTrees')}
            value={activeTrees.length}
            color="purple"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="px-4 mt-6 space-y-4">
        {/* Variety Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('treesByVariety')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={varietyData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {varietyData().map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom"
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Growth Stages */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('growthStages')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stageData().map((stage, i) => (
                <Badge 
                  key={i}
                  style={{ backgroundColor: stage.color + '20', color: stage.color, borderColor: stage.color }}
                  variant="outline"
                  className="text-sm py-1 px-3"
                >
                  {stage.name}: {stage.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">{t('upcomingTasks')}</CardTitle>
            <Link to={createPageUrl('Tasks')}>
              <Button variant="ghost" size="sm" className="text-emerald-600">
                {t('viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">{t('noTasks')}</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map(task => {
                  const status = getTaskStatus(task.due_date);
                  return (
                    <div 
                      key={task.id} 
                      className={cn(
                        "p-3 rounded-lg border",
                        status === 'overdue' ? "bg-red-50 border-red-200" :
                        status === 'today' ? "bg-amber-50 border-amber-200" :
                        "bg-white border-slate-200"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{task.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            status === 'overdue' ? "border-red-500 text-red-700" :
                            status === 'today' ? "border-amber-500 text-amber-700" :
                            "border-slate-300 text-slate-600"
                          )}
                        >
                          {task.task_type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onSelect={handleFormOpen} />

      {/* Tree Selector Modal */}
      {showTreeSelector && (
        <TreeSelector
          trees={trees}
          blocks={blocks}
          selectedTree={selectedTree}
          onSelect={handleTreeSelect}
          onClose={handleFormClose}
        />
      )}

      {/* Form Modals */}
      {activeForm === 'growth' && selectedTree && (
        <GrowthForm tree={selectedTree} onClose={handleFormClose} onSave={handleFormSave} />
      )}
      {activeForm === 'fertilizer' && selectedTree && (
        <FertilizerForm tree={selectedTree} farm={farm} onClose={handleFormClose} onSave={handleFormSave} />
      )}
      {activeForm === 'irrigation' && selectedTree && (
        <IrrigationForm tree={selectedTree} farm={farm} onClose={handleFormClose} onSave={handleFormSave} />
      )}
      {activeForm === 'pest' && selectedTree && (
        <PestForm tree={selectedTree} farm={farm} onClose={handleFormClose} onSave={handleFormSave} />
      )}
      {activeForm === 'harvest' && selectedTree && (
        <HarvestForm tree={selectedTree} farm={farm} onClose={handleFormClose} onSave={handleFormSave} />
      )}
    </div>
  );
}