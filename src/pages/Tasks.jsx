import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Check, Clock, AlertTriangle, Calendar, 
  X, Loader2, ChevronRight
} from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, isPast, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from "@/lib/utils";

const TASK_TYPES = ['Fertilizer', 'Pruning', 'Pest Scouting', 'Irrigation', 'Harvest Check', 'General'];

export default function Tasks() {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['allTasks'],
    queryFn: () => base44.entities.TaskSchedule.list('due_date')
  });

  const { data: trees = [] } = useQuery({
    queryKey: ['trees'],
    queryFn: () => base44.entities.Tree.list()
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => base44.entities.Block.list()
  });

  const { data: farms = [] } = useQuery({
    queryKey: ['farms'],
    queryFn: () => base44.entities.Farm.list()
  });

  const completeMutation = useMutation({
    mutationFn: (task) => base44.entities.TaskSchedule.update(task.id, {
      status: 'Completed',
      completed_date: format(new Date(), 'yyyy-MM-dd')
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allTasks'] })
  });

  const getTaskStatus = (task) => {
    if (task.status === 'Completed') return 'completed';
    const date = new Date(task.due_date);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    return 'upcoming';
  };

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const overdueTasks = pendingTasks.filter(t => {
    const date = new Date(t.due_date);
    return isPast(date) && !isToday(date);
  });

  // Calendar data
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const getTasksForDay = (day) => {
    return tasks.filter(t => isSameDay(new Date(t.due_date), day));
  };

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
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">{t('taskSchedule')}</h1>
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> {t('addTask')}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{overdueTasks.length}</p>
            <p className="text-xs text-amber-600">{t('overdue')}</p>
          </div>
          <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{pendingTasks.length}</p>
            <p className="text-xs text-blue-600">{t('pending')}</p>
          </div>
          <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{completedTasks.length}</p>
            <p className="text-xs text-emerald-600">{t('completed')}</p>
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full grid grid-cols-2 bg-slate-100">
            <TabsTrigger value="list">{t('listView')}</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'list' ? (
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-slate-300" />
                <p className="mt-2 text-slate-500">{t('noTasks')}</p>
              </div>
            ) : (
              pendingTasks.map(task => {
                const status = getTaskStatus(task);
                return (
                  <Card 
                    key={task.id} 
                    className={cn(
                      "border-0 shadow-sm",
                      status === 'overdue' && "border-l-4 border-l-red-500",
                      status === 'today' && "border-l-4 border-l-amber-500"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{task.title}</p>
                            {status === 'overdue' && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {task.task_type}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-slate-500 mt-2">{task.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-600 hover:bg-emerald-50"
                          onClick={() => completeMutation.mutate(task)}
                          disabled={completeMutation.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* Completed Tasks Section */}
            {completedTasks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-500 mb-3">{t('completed')}</h3>
                {completedTasks.slice(0, 5).map(task => (
                  <Card key={task.id} className="border-0 shadow-sm mb-2 opacity-60">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <p className="text-sm line-through text-slate-500">{task.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Calendar View */
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
              >
                ←
              </Button>
              <p className="font-semibold">{format(selectedDate, 'MMMM yyyy')}</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
              >
                →
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dayTasks = getTasksForDay(day);
                const hasOverdue = dayTasks.some(t => t.status === 'Pending' && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
                const hasPending = dayTasks.some(t => t.status === 'Pending');
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center text-sm",
                      day.getMonth() !== selectedDate.getMonth() && "text-slate-300",
                      isToday(day) && "bg-emerald-100 font-bold text-emerald-700"
                    )}
                  >
                    {day.getDate()}
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                        {hasPending && !hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Form Modal */}
      {showForm && (
        <TaskForm 
          farms={farms}
          trees={trees}
          blocks={blocks}
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['allTasks'] });
          }}
        />
      )}
    </div>
  );
}

function TaskForm({ farms, trees, blocks, onClose, onSave }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    farm_id: farms[0]?.id || '',
    tree_id: '',
    block_id: '',
    task_type: '',
    title: '',
    description: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    repeat_interval_days: 0,
    status: 'Pending'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.TaskSchedule.create({
      ...form,
      repeat_interval_days: parseInt(form.repeat_interval_days) || 0
    });
    setLoading(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('addTask')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label>{t('taskType')}</Label>
            <Select
              value={form.task_type}
              onValueChange={(v) => setForm({ ...form, task_type: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('title')}</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('description')}</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              className="mt-1"
              rows={2}
            />
          </div>

          <div>
            <Label>{t('dueDate')}</Label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('repeatEvery')}</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min="0"
                value={form.repeat_interval_days}
                onChange={(e) => setForm({ ...form, repeat_interval_days: e.target.value })}
                className="w-24"
              />
              <span className="text-sm text-slate-500">{t('days')}</span>
              <span className="text-xs text-slate-400">(0 = {t('noRepeat')})</span>
            </div>
          </div>

          {trees.length > 0 && (
            <div>
              <Label>{t('tree')} ({t('select')})</Label>
              <Select
                value={form.tree_id}
                onValueChange={(v) => setForm({ ...form, tree_id: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {trees.map(tree => (
                    <SelectItem key={tree.id} value={tree.id}>{tree.tree_code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}