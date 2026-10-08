import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`} />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <Skeleton className="w-1/3 h-4" />
      <Skeleton className="w-4/5 h-5" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="w-1/4 h-6" />
        <Skeleton className="w-1/4 h-8 rounded-full" />
      </div>
    </div>
  );
};
