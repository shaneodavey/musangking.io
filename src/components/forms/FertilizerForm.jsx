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

const FERTILIZER_TYPES = [
  'NPK 15-15-15',
  'NPK 16-16-16',
  'NPK 12-12-17',
  'Urea (46-0-0)',
  'KCl (0-0-60)',
  'Chicken Manure',
  'Cow Manure',
  'Compost',
  'Dolomite',
  'Borax',
  'Other'
];

const METHODS = ['Broadcast', 'Ring', 'Foliar', 'Drip'];

export default function FertilizerForm({ tree, farm, block, onClose, onSave }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tree_id: tree?.id || '',
    block_id: block?.id || '',
    farm_id: farm?.id || '',
    record_date: format(new Date(), 'yyyy-MM-dd'),
    fertilizer_type: '',
    amount_per_tree: '',
    amount_unit: 'kg',
    method: '',
    soil_ph: '',
    soil_ec: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...form,
      amount_per_tree: form.amount_per_tree ? parseFloat(form.amount_per_tree) : null,
      soil_ph: form.soil_ph ? parseFloat(form.soil_ph) : null,
      soil_ec: form.soil_ec ? parseFloat(form.soil_ec) : null,
    };
    
    await base44.entities.FertilizerRecord.create(data);
    setLoading(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('fertilizerRecord')}</h2>
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
            <Label>{t('fertilizerType')}</Label>
            <Select
              value={form.fertilizer_type}
              onValueChange={(v) => setForm({ ...form, fertilizer_type: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {FERTILIZER_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('amount')}</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={form.amount_per_tree}
                onChange={(e) => setForm({ ...form, amount_per_tree: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={form.amount_unit}
                onValueChange={(v) => setForm({ ...form, amount_unit: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">{t('kg')}</SelectItem>
                  <SelectItem value="g">{t('g')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t('method')}</Label>
            <Select
              value={form.method}
              onValueChange={(v) => setForm({ ...form, method: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('soilPh')}</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="0.0"
                value={form.soil_ph}
                onChange={(e) => setForm({ ...form, soil_ph: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('soilEc')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.0"
                value={form.soil_ec}
                onChange={(e) => setForm({ ...form, soil_ec: e.target.value })}
                className="mt-1"
              />
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