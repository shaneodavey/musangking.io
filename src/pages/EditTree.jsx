import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Loader2, Check, Trash2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const VARIETIES = ['Musang King', 'Monthong', 'Black Thorn', 'D24', 'Red Prawn', 'XO', 'Golden Phoenix', 'Tekka', 'Other'];
const STATUSES = ['Active', 'Sick', 'Dead', 'Removed'];

export default function EditTree() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const treeId = urlParams.get('id');

  const { data: tree, isLoading: treeLoading } = useQuery({
    queryKey: ['tree', treeId],
    queryFn: async () => {
      const trees = await base44.entities.Tree.filter({ id: treeId });
      return trees[0];
    },
    enabled: !!treeId
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => base44.entities.Block.list()
  });

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

  useEffect(() => {
    if (tree) {
      setForm({
        tree_code: tree.tree_code || '',
        farm_id: tree.farm_id || '',
        block_id: tree.block_id || '',
        variety: tree.variety || '',
        variety_other: tree.variety_other || '',
        planting_date: tree.planting_date || '',
        rootstock_type: tree.rootstock_type || '',
        row_spacing: tree.row_spacing || '',
        tree_spacing: tree.tree_spacing || '',
        status: tree.status || 'Active',
        gps_lat: tree.gps_lat || '',
        gps_lng: tree.gps_lng || '',
        notes: tree.notes || ''
      });
    }
  }, [tree]);

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

    await base44.entities.Tree.update(treeId, data);
    queryClient.invalidateQueries({ queryKey: ['trees'] });
    queryClient.invalidateQueries({ queryKey: ['tree', treeId] });
    setLoading(false);
    navigate(createPageUrl(`TreeProfile?id=${treeId}`));
  };

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.Tree.delete(treeId);
    queryClient.invalidateQueries({ queryKey: ['trees'] });
    setDeleting(false);
    navigate(createPageUrl('Trees'));
  };

  const farmBlocks = blocks.filter(b => b.farm_id === form.farm_id);

  if (treeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`TreeProfile?id=${treeId}`)}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">{t('edit')} {tree?.tree_code}</h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500">
              <Trash2 className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete')} Tree?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {tree?.tree_code} and all its records. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Tree Code */}
        <div>
          <Label>{t('treeId')}</Label>
          <Input
            value={form.tree_code}
            onChange={(e) => setForm({ ...form, tree_code: e.target.value })}
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
                <SelectItem value={null}>None</SelectItem>
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