import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, X, TrendingUp, Droplets, Bug, Apple, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingActionButton({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const actions = [
    { id: 'growth', icon: TrendingUp, label: t('growthRecord'), color: 'bg-emerald-500' },
    { id: 'fertilizer', icon: Leaf, label: t('fertilizerRecord'), color: 'bg-amber-500' },
    { id: 'irrigation', icon: Droplets, label: t('irrigationRecord'), color: 'bg-blue-500' },
    { id: 'pest', icon: Bug, label: t('pestRecord'), color: 'bg-red-500' },
    { id: 'harvest', icon: Apple, label: t('harvestRecord'), color: 'bg-purple-500' },
  ];

  const handleSelect = (id) => {
    setIsOpen(false);
    onSelect(id);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Menu */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3">
        <AnimatePresence>
          {isOpen && actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2"
            >
              <span className="bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-slate-700">
                {action.label}
              </span>
              <Button
                size="icon"
                className={cn("w-12 h-12 rounded-full shadow-lg", action.color)}
                onClick={() => handleSelect(action.id)}
              >
                <action.icon className="w-5 h-5 text-white" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Main FAB */}
        <Button
          size="icon"
          className={cn(
            "w-14 h-14 rounded-full shadow-xl transition-all",
            isOpen 
              ? "bg-slate-800 hover:bg-slate-700 rotate-45" 
              : "bg-emerald-600 hover:bg-emerald-700"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>
    </>
  );
}