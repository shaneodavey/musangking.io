import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, TreeDeciduous, Check } from "lucide-react";
import { useLanguage } from '../LanguageContext';
import { cn } from "@/lib/utils";

export default function TreeSelector({ trees, blocks, selectedTree, onSelect, onClose }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredTrees = trees.filter(tree => 
    tree.tree_code.toLowerCase().includes(search.toLowerCase()) ||
    tree.variety?.toLowerCase().includes(search.toLowerCase())
  );

  const getBlock = (blockId) => blocks.find(b => b.id === blockId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('select')} {t('tree')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchTrees')}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredTrees.length === 0 ? (
            <p className="text-center text-slate-500 py-8">{t('noTrees')}</p>
          ) : (
            <div className="space-y-1">
              {filteredTrees.map(tree => {
                const block = getBlock(tree.block_id);
                const isSelected = selectedTree?.id === tree.id;
                
                return (
                  <button
                    key={tree.id}
                    onClick={() => {
                      onSelect(tree);
                      onClose();
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
                      isSelected 
                        ? "bg-emerald-50 border-2 border-emerald-500" 
                        : "hover:bg-slate-50 border-2 border-transparent"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      tree.status === 'Active' ? "bg-emerald-100" : 
                      tree.status === 'Sick' ? "bg-amber-100" : "bg-slate-100"
                    )}>
                      <TreeDeciduous className={cn(
                        "w-4 h-4",
                        tree.status === 'Active' ? "text-emerald-600" : 
                        tree.status === 'Sick' ? "text-amber-600" : "text-slate-400"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900">{tree.tree_code}</p>
                      <p className="text-sm text-slate-500">
                        {tree.variety} {block ? `• ${block.name}` : ''}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}