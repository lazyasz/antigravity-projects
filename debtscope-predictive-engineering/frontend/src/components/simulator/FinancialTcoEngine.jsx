import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  Clock, 
  AlertOctagon, 
  FileText, 
  PieChart as PieIcon, 
  Layers, 
  ArrowUpRight, 
  Building2, 
  Percent, 
  Sliders, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Download,
  Printer
} from 'lucide-react';
import { getFinancialTcoAnalysis } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ChartTooltip from '../ui/ChartTooltip';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function FinancialTcoEngine({ onOpenBoardroomReport }) {
  const { showNotification } = useAuth();

  // Financial Parameter Controls
  const [hourlyRate, setHourlyRate] = useState(85);
  const [teamSize, setTeamSize] = useState(12);
  const [velocityDragPct, setVelocityDragPct] = useState(24.5);
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);

  const [tcoData, setTcoData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTcoData = async () => {
    setLoading(true);
    try {
      const data = await getFinancialTcoAnalysis({
        hourly_rate: parseFloat(hourlyRate) || 85.0,
        team_size: parseInt(teamSize) || 12,
        velocity_drag_pct: parseFloat(velocityDragPct) || 24.5
      });
      setTcoData(data);
    } catch (err) {
      console.error('Failed to load TCO analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTcoData();
  }, [hourlyRate, teamSize, velocityDragPct]);

  const kpis = tcoData?.kpis || {
    principal_debt_usd: 120742.50,
    total_debt_hours: 1420.5,
    monthly_interest_drag_usd: 65110.00,
    velocity_drag_monthly_usd: 39984.00,
    defect_overhead_monthly_usd: 25126.00,
    annualized_waste_usd: 781320.00,
    payback_period_months: 1.7,
    remediation_investment_usd: 72445.50,
    annual_drag_savings_usd: 507858.00,
    net_first_year_savings_usd: 435412.50,
    roi_multiplier: 7.0
  };

  const subsystems = tcoData?.subsystems || [];
  const projection = tcoData?.twelve_month_projection || [];

  return (
    <div className="space-y-5">
      
      {/* Executive Financial Header Banner */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-[#130e24] text-white rounded-xl border border-[#261c47] shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-[#b39ef2] font-mono text-[11px] font-bold tracking-wide uppercase border border-white/15">
              <DollarSign className="w-3 h-3 text-[#b39ef2]" />
              Executive Financial TCO Engine
            </span>
            <span className="text-xs text-[#88909e] font-mono">ISO/IEC 25010 Valuation Model</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Technical Debt Interest Rate & Balance Sheet TCO
          </h1>
          <p className="text-xs sm:text-sm text-[#d8cdfa]/80 max-w-3xl leading-relaxed">
            Converts code smells, high-cyclomatic churn, and regression defect risk into executive financial balance sheets: Principal Debt ($), Monthly Drag Interest ($), and Payback Breakeven.
          </p>
        </div>

        {/* 1-Click Boardroom Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onOpenBoardroomReport) {
                onOpenBoardroomReport();
              } else {
                showNotification('Generating Executive Financial Audit Package...', 'info');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7048e8] hover:bg-[#5b42a5] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Package Export</span>
          </button>
        </div>
      </section>

      {/* 5 Financial Bento KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Principal Debt */}
        <div className="p-4 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#88909e] font-semibold">
                1. Principal Debt
              </span>
              <div className="text-xl font-bold text-[#dc2626] tracking-tight mt-1 font-mono">
                ${Math.round(kpis.principal_debt_usd).toLocaleString()}
              </div>
            </div>
            <span className="p-1.5 rounded-lg bg-[#fef2f2] text-[#dc2626]">
              <AlertOctagon className="w-4 h-4" />
            </span>
          </div>
          <div className="pt-2.5 border-t border-[#e2e4ea] text-[11px] text-[#525866]">
            <span>{kpis.total_debt_hours}h @ ${hourlyRate}/hr</span>
          </div>
        </div>

        {/* KPI 2: Monthly Interest Drag */}
        <div className="p-4 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#88909e] font-semibold">
                2. Monthly Drag Interest
              </span>
              <div className="text-xl font-bold text-[#d97706] tracking-tight mt-1 font-mono">
                ${Math.round(kpis.monthly_interest_drag_usd).toLocaleString()}<span className="text-xs text-[#88909e] font-normal">/mo</span>
              </div>
            </div>
            <span className="p-1.5 rounded-lg bg-[#fffbeb] text-[#d97706]">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="pt-2.5 border-t border-[#e2e4ea] text-[11px] text-[#525866]">
            <span>Velocity drag + bug fix tax</span>
          </div>
        </div>

        {/* KPI 3: Annual Inaction Waste */}
        <div className="p-4 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#88909e] font-semibold">
                3. Annual Waste
              </span>
              <div className="text-xl font-bold text-[#0f1015] tracking-tight mt-1 font-mono">
                ${Math.round(kpis.annualized_waste_usd).toLocaleString()}
              </div>
            </div>
            <span className="p-1.5 rounded-lg bg-[#f3f4f8] text-[#525866]">
              <Building2 className="w-4 h-4 text-[#7048e8]" />
            </span>
          </div>
          <div className="pt-2.5 border-t border-[#e2e4ea] text-[11px] text-[#525866]">
            <span>12-Month compounding loss</span>
          </div>
        </div>

        {/* KPI 4: Payback Period */}
        <div className="p-4 bg-[#130e24] text-white rounded-xl border border-[#261c47] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#b39ef2] font-semibold">
                4. Payback Breakeven
              </span>
              <div className="text-xl font-bold text-white tracking-tight mt-1 font-mono">
                {kpis.payback_period_months} Months
              </div>
            </div>
            <span className="p-1.5 rounded-lg bg-white/10">
              <Clock className="w-4 h-4 text-[#b39ef2]" />
            </span>
          </div>
          <div className="pt-2.5 border-t border-white/10 text-[11px] text-[#b39ef2]">
            <span>Fully recouped in &lt; 2 mos</span>
          </div>
        </div>

        {/* KPI 5: Net 1-Year ROI Multiplier */}
        <div className="p-4 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#88909e] font-semibold">
                5. Net 1-Year ROI
              </span>
              <div className="text-xl font-bold text-[#059669] tracking-tight mt-1 font-mono">
                {kpis.roi_multiplier}x Multiplier
              </div>
            </div>
            <span className="p-1.5 rounded-lg bg-[#ecfdf5] text-[#059669]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="pt-2.5 border-t border-[#e2e4ea] text-[11px] text-[#059669] font-semibold">
            <span>+${Math.round(kpis.net_first_year_savings_usd).toLocaleString()} Net Savings</span>
          </div>
        </div>

      </section>

      {/* Financial Valuation Inputs Grid */}
      <section className="p-5 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[#0f1015]">
            Monetary Valuation Parameters & Headcount Modeling
          </h2>
          <p className="text-xs text-[#525866]">
            Adjust hourly rates, engineering headcount, and velocity drag factors to calculate localized financial TCO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          
          {/* Slider 1: Hourly Rate */}
          <div className="p-3.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#0f1015] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#7048e8]" />
                Blended Engineering Rate ($/hr)
              </label>
              <span className="font-mono font-bold text-xs text-[#5b42a5]">
                ${hourlyRate}/hr
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="200"
              step="5"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full accent-[#7048e8] cursor-pointer h-1.5 bg-[#e2e4ea] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#88909e]">
              <span>$40/hr</span>
              <span>$85/hr (Avg)</span>
              <span>$200/hr</span>
            </div>
          </div>

          {/* Slider 2: Team Headcount */}
          <div className="p-3.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#0f1015] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#5b42a5]" />
                Developer Headcount (Engineers)
              </label>
              <span className="font-mono font-bold text-xs text-[#5b42a5]">
                {teamSize} Engineers
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              step="1"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full accent-[#5b42a5] cursor-pointer h-1.5 bg-[#e2e4ea] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#88909e]">
              <span>2 Pod</span>
              <span>12 Squad</span>
              <span>60 Dept</span>
            </div>
          </div>

          {/* Slider 3: Velocity Drag % */}
          <div className="p-3.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#0f1015] flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#dc2626]" />
                Estimated Velocity Drag (%)
              </label>
              <span className="font-mono font-bold text-xs text-[#dc2626]">
                {velocityDragPct}% Drag
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={velocityDragPct}
              onChange={(e) => setVelocityDragPct(Number(e.target.value))}
              className="w-full accent-[#dc2626] cursor-pointer h-1.5 bg-[#e2e4ea] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#88909e]">
              <span>5% (Healthy)</span>
              <span>24.5% (Benchmark)</span>
              <span>50% (Crippled)</span>
            </div>
          </div>

        </div>
      </section>

      {/* 12-Month Compounding Drag vs Remediated Trajectory Chart */}
      <section className="p-5 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0f1015]">
              12-Month Cost of Inaction vs DebtScope Remediated Payoff Curve
            </h2>
            <p className="text-xs text-[#525866]">
              Status-quo compound interest drag vs upfront remediation investment and ongoing savings
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#f0ecfc] text-[#5b42a5] border border-[#d8cdfa]">
            Breakeven Month: M2
          </span>
        </div>

        <div className="h-64 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="inactionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="remediatedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7048e8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7048e8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e4ea" />
              <XAxis dataKey="month" stroke="#88909e" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis 
                stroke="#88909e" 
                fontSize={11} 
                fontFamily="JetBrains Mono"
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`} 
              />
              <Tooltip content={<ChartTooltip unit="$" />} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Area 
                type="monotone" 
                dataKey="inaction_cumulative_cost" 
                name="Cost of Inaction (Compounding Drag $)" 
                stroke="#dc2626" 
                strokeWidth={2} 
                fill="url(#inactionGrad)" 
              />
              <Area 
                type="monotone" 
                dataKey="remediated_cumulative_cost" 
                name="DebtScope Remediated Trajectory ($)" 
                stroke="#7048e8" 
                strokeWidth={2} 
                fill="url(#remediatedGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Subsystem Financial Breakdown Table */}
      <section className="p-5 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0f1015]">
              Subsystem Financial Friction & Balance Sheet Breakdown
            </h2>
            <p className="text-xs text-[#525866]">
              Detailed cost allocation, principal debt valuation, and remediation payback by architecture subsystem
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#88909e]">
            5 Monitored Subsystems
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#e2e4ea]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#e2e4ea] text-[#88909e] uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3 font-semibold">Subsystem Domain</th>
                <th className="py-2.5 px-3 font-semibold text-center">LOC</th>
                <th className="py-2.5 px-3 font-semibold text-center">Avg Complexity</th>
                <th className="py-2.5 px-3 font-semibold text-center">Principal Debt ($)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Monthly Drag ($)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Payback</th>
                <th className="py-2.5 px-3 font-semibold text-right">Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f8]">
              {subsystems.map((sub) => (
                <tr 
                  key={sub.id} 
                  onClick={() => setSelectedSubsystem(sub)}
                  className="hover:bg-[#f8f9fb] transition cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-semibold text-[#0f1015]">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs">{sub.name}</span>
                      <span className="text-[10px] text-[#88909e] font-mono mt-0.5">{sub.recommended_action}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[#525866]">
                    {sub.loc.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0f1015]">
                    {sub.complexity_avg}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[#dc2626]">
                    ${Math.round(sub.principal_debt_usd).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[#d97706]">
                    ${Math.round(sub.monthly_drag_usd).toLocaleString()}/mo
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[#5b42a5]">
                    {sub.payback_months} mos
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold border ${
                      sub.risk_tier === 'CRITICAL' 
                        ? 'bg-[#fef2f2] text-[#dc2626] border-[#fca5a5]' 
                        : sub.risk_tier === 'HIGH' 
                        ? 'bg-[#fffbeb] text-[#b45309] border-[#fcd34d]' 
                        : 'bg-[#f0ecfc] text-[#5b42a5] border-[#d8cdfa]'
                    }`}>
                      {sub.risk_tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
