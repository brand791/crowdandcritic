'use client';

interface RankingBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  icon?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RankingBar({
  label,
  value,
  maxValue = 100,
  color = '#f5a623',
  icon,
  showValue = true,
  size = 'md',
}: RankingBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  const textClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`${textClass} text-[#888] flex items-center gap-1`}>
          {icon && <span>{icon}</span>}
          {label}
        </span>
        {showValue && (
          <span className={`${textClass} font-semibold tabular-nums`} style={{ color }}>
            {value.toFixed(1)}
          </span>
        )}
      </div>
      <div className={`w-full ${heightClass} rounded-full bg-[#222] overflow-hidden`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

// Score breakdown component used on movie detail pages (v4 simplified)
interface ScoreBreakdownProps {
  rtScore: number;
  imdbScore: number;
  compositeScore: number;
}

export function ScoreBreakdown({
  rtScore,
  imdbScore,
  compositeScore,
}: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Ranking Formula</h3>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#f5a623]">{compositeScore.toFixed(1)}</div>
          <div className="text-xs text-[#666]">out of 100</div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <RankingBar
            label="Rotten Tomatoes"
            value={rtScore}
            color="#ef4444"
            icon="🍅"
            size="md"
          />
          <p className="text-xs text-[#555] mt-1">50% weight — Critic consensus</p>
        </div>

        <div>
          <RankingBar
            label="IMDb"
            value={imdbScore}
            color="#f5a623"
            icon="👥"
            size="md"
          />
          <p className="text-xs text-[#555] mt-1">50% weight — Audience rating</p>
        </div>
      </div>

      {/* Composite score formula */}
      <div className="mt-6 p-4 rounded-lg bg-[#111] border border-[#222] text-xs text-[#555] font-mono">
        <div className="text-[#666] mb-2 font-sans font-medium text-sm">How we calculate the score</div>
        <div className="space-y-1">
          <div>
            <span className="text-[#ef4444]">RT {rtScore.toFixed(1)}</span>
            <span className="text-[#444]"> × 0.50 </span>
          </div>
          <div>
            <span className="text-[#f5a623]">+ IMDb {imdbScore.toFixed(1)}</span>
            <span className="text-[#444]"> × 0.50 </span>
          </div>
          <div className="border-t border-[#222] pt-2 mt-2">
            <span className="text-[#f5a623] font-semibold">= {compositeScore.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
