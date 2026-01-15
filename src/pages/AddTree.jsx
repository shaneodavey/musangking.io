import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Loader2, Check } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

const VARIETIES = ['Musang King', 'Monthong', 'Black Thorn', 'D24', 'Red Prawn', 'XO', 'Golden Phoenix', 'Tekka', 'Other'];
const STATUSES = ['Active', 'Sick', 'Dead', 'Removed'];

export default function AddTree() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

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

  const farm = farms[0];

  const generateTreeCode = () => {
    const prefix = farm?.name?.substring(0, 2).toUpperCase() || 'TR';
    const nextNum = trees.length + 1;
    return `${prefix}-${String(nextNum).padStart(4, '0')}`;
  };

  const [form, setForm] = useState({
    tree_code: '',
    farm_id: '',
    block_id: '',
    variety: '',
    variety_other: '',
    planting_date: '',
    rootstock_type: '',
    row_spacing: '',
    tree_spacing: '',
    status: 'Active',
    gps_lat: '',
    gps_lng: '',
    notes: ''
  });

  // Set farm_id when farm is loaded
  React.useEffect(() => {
    if (farm && !form.farm_id) {
      setForm(prev => ({
        ...prev,
        farm_id: farm.id,
        tree_code: generateTreeCode()
      }));
    }
  }, [farm]);

  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          gps_lat: position.coords.latitude,
          gps_lng: position.coords.longitude
        }));
        setGpsLoading(false);
      },
      (error) => {
        alert('Unable to get location. Please try again.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...form,
      row_spacing: form.row_spacing ? parseFloat(form.row_spacing) : null,
      tree_spacing: form.tree_spacing ? parseFloat(form.tree_spacing) : null,
      gps_lat: form.gps_lat ? parseFloat(form.gps_lat) : null,
      gps_lng: form.gps_lng ? parseFloat(form.gps_lng) : null,
    };

    await base44.entities.Tree.create(data);
    queryClient.invalidateQueries({ queryKey: ['trees'] });
    setLoading(false);
    navigate(createPageUrl('Trees'));
  };

  const farmBlocks = blocks.filter(b => b.farm_id === form.farm_id);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link to={createPageUrl('Trees')}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">Add New Tree</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Tree Code */}
        <div>
          <Label>{t('treeId')}</Label>
          <Input
            value={form.tree_code}
            onChange={(e) => setForm({ ...form, tree_code: e.target.value })}
            placeholder="TR-0001"
            required
            className="mt-1"
          />
        </div>

        {/* Variety */}
        <div>
          <Label>{t('variety')}</Label>
          <Select
            value={form.variety}
            onValueChange={(v) => setForm({ ...form, variety: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t('select')} />
            </SelectTrigger>
            <SelectContent>
              {VARIETIES.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.variety === 'Other' && (
          <div>
            <Label>Variety Name</Label>
            <Input
              value={form.variety_other}
              onChange={(e) => setForm({ ...form, variety_other: e.target.value })}
              placeholder="Enter variety name"
              className="mt-1"
            />
          </div>
        )}

        {/* Block */}
        {farmBlocks.length > 0 && (
          <div>
            <Label>{t('block')}</Label>
            <Select
              value={form.block_id}
              onValueChange={(v) => setForm({ ...form, block_id: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {farmBlocks.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Planting Date */}
        <div>
          <Label>{t('plantingDate')}</Label>
          <Input
            type="date"
            value={form.planting_date}
            onChange={(e) => setForm({ ...form, planting_date: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Status */}
        <div>
          <Label>{t('status')}</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>{t(s.toLowerCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rootstock */}
        <div>
          <Label>{t('rootstock')}</Label>
          <Input
            value={form.rootstock_type}
            onChange={(e) => setForm({ ...form, rootstock_type: e.target.value })}
            placeholder="e.g., D2, Local seedling"
            className="mt-1"
          />
        </div>

        {/* Spacing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Row Spacing (m)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={form.row_spacing}
              onChange={(e) => setForm({ ...form, row_spacing: e.target.value })}
              placeholder="0.0"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Tree Spacing (m)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={form.tree_spacing}
              onChange={(e) => setForm({ ...form, tree_spacing: e.target.value })}
              placeholder="0.0"
              className="mt-1"
            />
          </div>
        </div>

        {/* GPS */}
        <div>
          <Label>{t('location')} (GPS)</Label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              step="any"
              value={form.gps_lat}
              onChange={(e) => setForm({ ...form, gps_lat: e.target.value })}
              placeholder="Latitude"
              className="flex-1"
            />
            <Input
              type="number"
              step="any"
              value={form.gps_lng}
              onChange={(e) => setForm({ ...form, gps_lng: e.target.value })}
              placeholder="Longitude"
              className="flex-1"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={captureGPS}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Capture Current Location
          </Button>
        </div>

        {/* Notes */}
        <div>
          <Label>{t('notes')}</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes"
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {t('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}