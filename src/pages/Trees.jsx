import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import TreeCard from '../components/ui/TreeCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, List, Map, Filter, Loader2, TreeDeciduous, Plus } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
  Active: '#10b981',
  Sick: '#f59e0b',
  Dead: '#ef4444',
  Removed: '#6b7280'
};

const VARIETIES = ['Musang King', 'Monthong', 'Black Thorn', 'D24', 'Red Prawn', 'XO', 'Golden Phoenix', 'Tekka', 'Other'];
const STATUSES = ['Active', 'Sick', 'Dead', 'Removed'];

export default function Trees() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [variety, setVariety] = useState('all');
  const [status, setStatus] = useState('all');
  const [blockFilter, setBlockFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);

  const { data: trees = [], isLoading } = useQuery({
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

  const farm = farms[0];

  const filteredTrees = trees.filter(tree => {
    const matchSearch = tree.tree_code.toLowerCase().includes(search.toLowerCase()) ||
                        tree.variety?.toLowerCase().includes(search.toLowerCase());
    const matchVariety = variety === 'all' || tree.variety === variety;
    const matchStatus = status === 'all' || tree.status === status;
    const matchBlock = blockFilter === 'all' || tree.block_id === blockFilter;
    return matchSearch && matchVariety && matchStatus && matchBlock;
  });

  const getBlock = (blockId) => blocks.find(b => b.id === blockId);

  const treesWithGPS = filteredTrees.filter(t => t.gps_lat && t.gps_lng);
  const defaultCenter = farm?.gps_lat && farm?.gps_lng 
    ? [farm.gps_lat, farm.gps_lng]
    : treesWithGPS.length > 0 
      ? [treesWithGPS[0].gps_lat, treesWithGPS[0].gps_lng]
      : [3.1390, 101.6869]; // Default to Malaysia

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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchTrees')}
                className="pl-9 bg-slate-50 border-0"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-emerald-50 border-emerald-500")}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              <Select value={variety} onValueChange={setVariety}>
                <SelectTrigger className="w-36 shrink-0">
                  <SelectValue placeholder={t('allVarieties')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allVarieties')}</SelectItem>
                  {VARIETIES.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-32 shrink-0">
                  <SelectValue placeholder={t('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{t(s.toLowerCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {blocks.length > 0 && (
                <Select value={blockFilter} onValueChange={setBlockFilter}>
                  <SelectTrigger className="w-32 shrink-0">
                    <SelectValue placeholder={t('allBlocks')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allBlocks')}</SelectItem>
                    {blocks.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* View Toggle */}
          <div className="mt-3 flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && "bg-emerald-600 hover:bg-emerald-700")}
            >
              <List className="w-4 h-4 mr-1" /> {t('listView')}
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className={cn(viewMode === 'map' && "bg-emerald-600 hover:bg-emerald-700")}
            >
              <Map className="w-4 h-4 mr-1" /> {t('mapView')}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredTrees.length === 0 ? (
              <div className="text-center py-12">
                <TreeDeciduous className="w-12 h-12 mx-auto text-slate-300" />
                <p className="mt-2 text-slate-500">{t('noTrees')}</p>
              </div>
            ) : (
              filteredTrees.map(tree => (
                <TreeCard key={tree.id} tree={tree} block={getBlock(tree.block_id)} />
              ))
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden shadow-sm">
            <MapContainer
              center={defaultCenter}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {treesWithGPS.map(tree => (
                <CircleMarker
                  key={tree.id}
                  center={[tree.gps_lat, tree.gps_lng]}
                  radius={10}
                  fillColor={STATUS_COLORS[tree.status]}
                  color="#fff"
                  weight={2}
                  opacity={1}
                  fillOpacity={0.8}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">{tree.tree_code}</p>
                      <p className="text-sm text-slate-600">{tree.variety}</p>
                      <Link 
                        to={createPageUrl(`TreeProfile?id=${tree.id}`)}
                        className="text-emerald-600 text-sm"
                      >
                        {t('overview')} →
                      </Link>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Add Tree FAB */}
      <Link to={createPageUrl('AddTree')}>
        <Button
          size="icon"
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-xl bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}