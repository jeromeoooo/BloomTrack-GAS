import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { PREGNANCY_WEEKS } from '../data/pregnancyMilestones';
import { getWeekStartDate, formatDateISO } from '../services/calendarService';
import { TrendingUp, Scale, Sparkles, Ruler, Info, Calendar } from 'lucide-react';

interface FetalGrowthChartProps {
  currentWeekNum: number;
  startWeek: number;
  weeksCount: number;
  lmpDate: Date;
  onSelectWeek?: (week: number) => void;
}

type WeightUnit = 'metric' | 'imperial'; // grams/kg vs oz/lbs
type ChartMode = 'weight' | 'length';

export const FetalGrowthChart: React.FC<FetalGrowthChartProps> = ({
  currentWeekNum,
  startWeek,
  weeksCount,
  lmpDate,
  onSelectWeek,
}) => {
  const [unit, setUnit] = useState<WeightUnit>('metric');
  const [chartMode, setChartMode] = useState<ChartMode>('weight');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  // Transform milestone data for Recharts
  const chartData = useMemo(() => {
    return PREGNANCY_WEEKS.map((w) => {
      const date = getWeekStartDate(lmpDate, w.week);
      const dateStr = formatDateISO(date);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      // Weight conversions
      const weightG = w.weightGrams;
      const weightKg = Number((weightG / 1000).toFixed(2));
      const weightOz = Number((weightG / 28.3495).toFixed(1));
      const weightLb = Number((weightG / 453.592).toFixed(2));

      // Length conversions
      const lengthCm = w.lengthCm;
      const lengthIn = Number((lengthCm / 2.54).toFixed(1));

      return {
        week: w.week,
        weekLabel: `Wk ${w.week}`,
        dateStr,
        formattedDate,
        fruit: w.sizeFruit,
        emoji: w.sizeEmoji,
        trimester: w.trimester,
        headline: w.headline,
        // Metrics
        weightGrams: weightG,
        weightKg,
        weightOz,
        weightLb,
        // Chart display value based on unit
        displayWeight: unit === 'metric' ? (weightG >= 1000 ? weightKg * 1000 : weightG) : weightOz,
        displayWeightFormatted:
          unit === 'metric'
            ? weightG >= 1000
              ? `${(weightG / 1000).toFixed(2)} kg`
              : `${weightG} g`
            : weightG >= 453.592
            ? `${weightLb} lbs`
            : `${weightOz} oz`,
        lengthCm,
        lengthIn,
        displayLength: unit === 'metric' ? lengthCm : lengthIn,
        displayLengthFormatted: unit === 'metric' ? `${lengthCm} cm` : `${lengthIn} in`,
      };
    });
  }, [lmpDate, unit]);

  // Current active week data
  const currentData = useMemo(() => {
    const bounded = Math.max(1, Math.min(40, currentWeekNum));
    return chartData.find((d) => d.week === bounded) || chartData[0];
  }, [chartData, currentWeekNum]);

  // Next week's gain velocity
  const weeklyGainEstimate = useMemo(() => {
    const currentIdx = Math.max(0, Math.min(39, currentWeekNum - 1));
    const nextIdx = Math.min(39, currentIdx + 1);
    const diffGrams = Math.round(chartData[nextIdx].weightGrams - chartData[currentIdx].weightGrams);
    if (unit === 'metric') {
      return `+${diffGrams} g/wk`;
    }
    const diffOz = (diffGrams / 28.3495).toFixed(1);
    return `+${diffOz} oz/wk`;
  }, [chartData, currentWeekNum, unit]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100/80 mb-8 transition-all">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            Fetal Growth Projections (Recharts)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Weekly Fetal Size & Weight Gain Trend
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Standard medical growth trajectory from Week 1 to full term (Week 40), highlighting your current week.
          </p>
        </div>

        {/* Controls: Mode & Units */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Metric / Imperial Unit Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setUnit('metric')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                unit === 'metric'
                  ? 'bg-white text-gray-900 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Metric (g / cm)
            </button>
            <button
              type="button"
              onClick={() => setUnit('imperial')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                unit === 'imperial'
                  ? 'bg-white text-gray-900 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Imperial (oz / in)
            </button>
          </div>

          {/* Weight vs Length toggle */}
          <div className="flex p-1 bg-rose-50 rounded-xl text-xs font-medium border border-rose-100">
            <button
              type="button"
              onClick={() => setChartMode('weight')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'weight'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Weight Gain</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('length')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'length'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Length</span>
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Metric Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mb-6">
        <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-2xl">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide block">
            Current Week ({currentData.week})
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xl">{currentData.emoji}</span>
            <span className="text-sm font-bold text-gray-900 truncate">
              {currentData.fruit}
            </span>
          </div>
          <span className="text-xs text-rose-600 font-semibold mt-0.5 block">
            {chartMode === 'weight'
              ? currentData.displayWeightFormatted
              : currentData.displayLengthFormatted}
          </span>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
            Weekly Growth Velocity
          </span>
          <span className="text-base font-extrabold text-amber-900 mt-1 block">
            {weeklyGainEstimate}
          </span>
          <span className="text-[11px] text-amber-700 block">
            Peak acceleration in 3rd Trim
          </span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
            Halfway (Wk 20) Benchmark
          </span>
          <span className="text-base font-extrabold text-emerald-900 mt-1 block">
            {unit === 'metric' ? '300 g • 16.4 cm' : '10.6 oz • 6.5 in'}
          </span>
          <span className="text-[11px] text-emerald-700 block">
            Banana size • Anatomy scan
          </span>
        </div>

        <div className="bg-purple-50/50 border border-purple-100 p-3.5 rounded-2xl">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide block">
            Full Term (Wk 40) Benchmark
          </span>
          <span className="text-base font-extrabold text-purple-900 mt-1 block">
            {unit === 'metric' ? '~3.5 kg • 51.2 cm' : '~7.6 lbs • 20.2 in'}
          </span>
          <span className="text-[11px] text-purple-700 block">
            Pumpkin size • Due Date
          </span>
        </div>
      </div>

      {/* Main Recharts Area Container */}
      <div className="w-full h-72 sm:h-80 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const clickedWeek = state.activePayload[0].payload.week;
                if (onSelectWeek) onSelectWeek(clickedWeek);
              }
            }}
          >
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#fb7185" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ffe4e6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lengthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#e0f2fe" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(wk) => `W${wk}`}
              interval={3}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(val) => {
                if (chartMode === 'weight') {
                  if (unit === 'metric') {
                    return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}g`;
                  }
                  return `${val}oz`;
                }
                return unit === 'metric' ? `${val}cm` : `${val}"`;
              }}
              domain={[0, 'auto']}
            />

            {/* Reference line marking Current Pregnancy Week */}
            <ReferenceLine
              x={currentWeekNum}
              stroke="#e11d48"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `📍 Current (Wk ${currentWeekNum})`,
                position: 'top',
                fill: '#be123c',
                fontSize: 11,
                fontWeight: 700,
              }}
            />

            {/* Custom Interactive Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-xl border border-gray-800 text-xs min-w-[220px]">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <span>{d.emoji}</span>
                        <span>Week {d.week}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {d.formattedDate}
                      </span>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Size Comparison:</span>
                        <span className="font-semibold text-rose-300">{d.fruit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Est. Weight:</span>
                        <span className="font-bold text-white">{d.displayWeightFormatted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Est. Length:</span>
                        <span className="font-bold text-white">{d.displayLengthFormatted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Trimester:</span>
                        <span className="font-semibold text-amber-300">
                          {d.trimester === 1
                            ? '1st Trimester'
                            : d.trimester === 2
                            ? '2nd Trimester'
                            : '3rd Trimester'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-300 italic pt-1 border-t border-gray-800">
                      "{d.headline}"
                    </p>
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold text-center">
                      Click to jump to Week {d.week} in timeline
                    </p>
                  </div>
                );
              }}
            />

            {/* The Growth Area curve */}
            <Area
              type="monotone"
              dataKey={chartMode === 'weight' ? 'displayWeight' : 'displayLength'}
              stroke={chartMode === 'weight' ? '#f43f5e' : '#0ea5e9'}
              strokeWidth={3}
              fillOpacity={1}
              fill={chartMode === 'weight' ? 'url(#weightGrad)' : 'url(#lengthGrad)'}
              activeDot={{
                r: 6,
                stroke: '#ffffff',
                strokeWidth: 2,
                fill: chartMode === 'weight' ? '#e11d48' : '#0284c7',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trimester Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>1st Trimester (Wk 1–13): 0–23g</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>2nd Trimester (Wk 14–27): 43–875g</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>3rd Trimester (Wk 28–40): 1kg–3.5kg</span>
          </div>
        </div>

        <span className="text-[11px] text-gray-400 italic flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-gray-400" />
          Click any data point on the chart to scroll directly to that week's card
        </span>
      </div>
    </div>
  );
};
