import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

const HARVEST_STAGES = ['First Flower', 'Peak Flower', 'Fruit Set', 'Harvest'];

export default function HarvestForm({ tree, farm, onClose, onSave }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tree_id: tree?.id || '',
    farm_id: farm?.id || '',
    record_date: format(new Date(), 'yyyy-MM-dd'),
    stage: '',
    estimated_fruit_count: '',
    harvested_fruit_count: '',
    total_weight_kg: '',
    grade_a_count: '',
    grade_b_count: '',
    grade_c_count: '',
    price_per_kg: '',
    total_revenue: '',
    notes: ''
  });

  const calculateRevenue = () => {
    const weight = parseFloat(form.total_weight_kg) || 0;
    const price = parseFloat(form.price_per_kg) || 0;
    return (weight * price).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...form,
      estimated_fruit_count: form.estimated_fruit_count ? parseInt(form.estimated_fruit_count) : null,
      harvested_fruit_count: form.harvested_fruit_count ? parseInt(form.harvested_fruit_count) : null,
      total_weight_kg: form.total_weight_kg ? parseFloat(form.total_weight_kg) : null,
      grade_a_count: form.grade_a_count ? parseInt(form.grade_a_count) : null,
      grade_b_count: form.grade_b_count ? parseInt(form.grade_b_count) : null,
      grade_c_count: form.grade_c_count ? parseInt(form.grade_c_count) : null,
      price_per_kg: form.price_per_kg ? parseFloat(form.price_per_kg) : null,
      total_revenue: form.price_per_kg && form.total_weight_kg ? parseFloat(calculateRevenue()) : null,
    };
    
    await base44.entities.HarvestRecord.create(data);
    setLoading(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('harvestRecord')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label>{t('date')}</Label>
            <Input
              type="date"
              value={form.record_date}
              onChange={(e) => setForm({ ...form, record_date: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('floweringStage')}</Label>
            <Select
              value={form.stage}
              onValueChange={(v) => setForm({ ...form, stage: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {HARVEST_STAGES.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('estimatedFruits')}</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.estimated_fruit_count}
                onChange={(e) => setForm({ ...form, estimated_fruit_count: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('harvestedFruits')}</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.harvested_fruit_count}
                onChange={(e) => setForm({ ...form, harvested_fruit_count: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>{t('totalWeight')}</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={form.total_weight_kg}
              onChange={(e) => setForm({ ...form, total_weight_kg: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-slate-700 mb-3">{t('gradeBreakdown')}</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Grade A</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.grade_a_count}
                  onChange={(e) => setForm({ ...form, grade_a_count: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Grade B</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.grade_b_count}
                  onChange={(e) => setForm({ ...form, grade_b_count: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Grade C</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.grade_c_count}
                  onChange={(e) => setForm({ ...form, grade_c_count: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('pricePerKg')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price_per_kg}
                  onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('totalRevenue')}</Label>
                <div className="mt-1 px-3 py-2 bg-emerald-50 rounded-lg text-emerald-700 font-semibold">
                  {calculateRevenue()}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>{t('notes')}</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t('notes')}
              className="mt-1"
              rows={3}
            />
          </div>

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