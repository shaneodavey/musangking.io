import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreeDeciduous, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TreeCard({ tree, block }) {
  const { t } = useLanguage();
  
  const statusColors = {
    Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Sick: "bg-amber-100 text-amber-700 border-amber-200",
    Dead: "bg-red-100 text-red-700 border-red-200",
    Removed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const getAge = () => {
    if (!tree.planting_date) return null;
    const planted = new Date(tree.planting_date);
    const now = new Date();
    const months = (now.getFullYear() - planted.getFullYear()) * 12 + 
                   (now.getMonth() - planted.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} ${t('years')}${remainingMonths > 0 ? ` ${remainingMonths} ${t('months')}` : ''}`;
    }
    return `${months} ${t('months')}`;
  };

  const variety = tree.variety === 'Other' ? tree.variety_other : tree.variety;

  return (
    <Link to={createPageUrl(`TreeProfile?id=${tree.id}`)}>
      <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-xl",
            tree.status === 'Active' ? "bg-emerald-50" : 
            tree.status === 'Sick' ? "bg-amber-50" : "bg-slate-50"
          )}>
            <TreeDeciduous className={cn(
              "w-5 h-5",
              tree.status === 'Active' ? "text-emerald-600" : 
              tree.status === 'Sick' ? "text-amber-600" : "text-slate-400"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 truncate">
                {tree.tree_code}
              </h3>
              <Badge 
                variant="outline" 
                className={cn("text-xs shrink-0", statusColors[tree.status])}
              >
                {t(tree.status?.toLowerCase())}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-600 mt-0.5">{variety}</p>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              {getAge() && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {getAge()}
                </span>
              )}
              {block && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {block.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}