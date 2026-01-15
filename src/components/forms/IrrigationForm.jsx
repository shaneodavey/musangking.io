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

const IRRIGATION_METHODS = ['Rainfed', 'Drip', 'Sprinkler', 'Manual'];
const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rain', 'Heavy Rain'];

export default function IrrigationForm({ tree, farm, block, onClose, onSave }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tree_id: tree?.id || '',
    block_id: block?.id || '',
    farm_id: farm?.id || '',
    record_date: format(new Date(), 'yyyy-MM-dd'),
    irrigation_method: '',
    duration_minutes: '',
    volume_liters: '',
    weather: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...form,
      duration_minutes: form.duration_minutes ? parseFloat(form.duration_minutes) : null,
      volume_liters: form.volume_liters ? parseFloat(form.volume_liters) : null,
    };
    
    await base44.entities.IrrigationRecord.create(data);
    setLoading(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('irrigationRecord')}</h2>
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
            <Label>{t('irrigationMethod')}</Label>
            <Select
              value={form.irrigation_method}
              onValueChange={(v) => setForm({ ...form, irrigation_method: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {IRRIGATION_METHODS.map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('duration')}</Label>
              <Input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('volume')}</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={form.volume_liters}
                onChange={(e) => setForm({ ...form, volume_liters: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>{t('weather')}</Label>
            <Select
              value={form.weather}
              onValueChange={(v) => setForm({ ...form, weather: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {WEATHER_OPTIONS.map(weather => (
                  <SelectItem key={weather} value={weather}>{weather}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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