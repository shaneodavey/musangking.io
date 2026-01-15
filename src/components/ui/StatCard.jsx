import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  trend,
  color = "emerald",
  className 
}) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <Card className={cn("p-4 bg-white border-0 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>
          {subValue && (
            <p className="mt-0.5 text-xs text-slate-500">{subValue}</p>
          )}
          {trend && (
            <p className={cn(
              "mt-1 text-xs font-medium",
              trend > 0 ? "text-emerald-600" : "text-red-500"
            )}>
              {trend > 0 ? "+" : ""}{trend}%
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}