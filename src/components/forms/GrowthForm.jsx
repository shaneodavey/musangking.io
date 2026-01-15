import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Camera, Loader2 } from "lucide-react";
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

const GROWTH_STAGES = [
  'Flush', 'Vegetative', 'Flower Bud', 'Flowering', 
  'Fruit Set', 'Maturing', 'Harvest', 'Rest'
];

export default function GrowthForm({ tree, onClose, onSave }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    tree_id: tree?.id || '',
    record_date: format(new Date(), 'yyyy-MM-dd'),
    height_m: '',
    trunk_diameter_cm: '',
    canopy_diameter_m: '',
    growth_stage: '',
    vigor_score: 3,
    photos: [],
    notes: ''
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photos: [...prev.photos, file_url] }));
    setUploading(false);
  };

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...form,
      height_m: form.height_m ? parseFloat(form.height_m) : null,
      trunk_diameter_cm: form.trunk_diameter_cm ? parseFloat(form.trunk_diameter_cm) : null,
      canopy_diameter_m: form.canopy_diameter_m ? parseFloat(form.canopy_diameter_m) : null,
    };
    
    await base44.entities.GrowthRecord.create(data);
    setLoading(false);
    onSave();
  };

  const stageTranslations = {
    'Flush': t('flush'),
    'Vegetative': t('vegetative'),
    'Flower Bud': t('flowerBud'),
    'Flowering': t('flowering'),
    'Fruit Set': t('fruitSet'),
    'Maturing': t('maturing'),
    'Harvest': t('harvest'),
    'Rest': t('rest'),
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('growthRecord')}</h2>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('height')}</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={form.height_m}
                onChange={(e) => setForm({ ...form, height_m: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('trunkDiameter')}</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={form.trunk_diameter_cm}
                onChange={(e) => setForm({ ...form, trunk_diameter_cm: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>{t('canopyDiameter')}</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={form.canopy_diameter_m}
              onChange={(e) => setForm({ ...form, canopy_diameter_m: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('stage')}</Label>
            <Select
              value={form.growth_stage}
              onValueChange={(v) => setForm({ ...form, growth_stage: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {GROWTH_STAGES.map(stage => (
                  <SelectItem key={stage} value={stage}>
                    {stageTranslations[stage]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('vigor')} ({form.vigor_score})</Label>
            <Slider
              value={[form.vigor_score]}
              onValueChange={([v]) => setForm({ ...form, vigor_score: v })}
              min={1}
              max={5}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 (Poor)</span>
              <span>5 (Excellent)</span>
            </div>
          </div>

          <div>
            <Label>{t('photos')}</Label>
            <div className="mt-2 flex gap-2 flex-wrap">
              {form.photos.map((url, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.photos.length < 3 && (
                <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                </label>
              )}
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