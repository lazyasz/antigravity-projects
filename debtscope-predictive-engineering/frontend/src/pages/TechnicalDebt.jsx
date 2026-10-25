import React from 'react';
import { useTechnicalDebt } from '../hooks/useTechnicalDebt';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import DebtTable from '../components/tables/DebtTable';

export default function TechnicalDebt() {
  const { data, loading, error } = useTechnicalDebt();

  if (loading) return <LoadingState message="Loading technical debt repository inventory..." />;
  if (error) return <ErrorState message={error} />;
  if (!data || data.length === 0) return <EmptyState title="No technical debt items found" />;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] mx-auto animate-fade-in">
      <section className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-[#e2e4ea] shadow-[0_4px_20px_-4px_rgba(19,14,36,0.04)] flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0ecff] text-[#5b42a5] font-mono text-[11px] font-bold tracking-wide uppercase border border-[#d8cffc]/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7048e8] animate-pulse"></span>
              Comprehensive Inventory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#130e24] tracking-tight">
            Technical Debt Inventory ({data.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#525866]">
            Complete telemetry database of code friction, algorithmic complexity, and predicted regression hot-zones.
          </p>
        </div>
      </section>

      <section className="p-6 bg-white rounded-3xl border border-[#e2e4ea] shadow-[0_4px_20px_-4px_rgba(19,14,36,0.04)]">
        <DebtTable data={data} />
      </section>
    </div>
  );
}
