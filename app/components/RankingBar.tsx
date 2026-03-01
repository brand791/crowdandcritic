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

// Score breakdown component used on movie detail pages
interface ScoreBreakdownProps {
  criticScore: number;
  audienceScore: number;
  canonScore: number;
  longevityBonus: number;
  popularityWeight: number;
  compositeScore: number;
}

export function ScoreBreakdown({
  criticScore,
  audienceScore,
  canonScore,
  longevityBonus,
  popularityWeight,
  compositeScore,
}: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Score Breakdown</h3>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#f5a623]">{compositeScore.toFixed(1)}</div>
          <div className="text-xs text-[#666]">out of 100</div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <RankingBar
            label="Critic Score"
            value={criticScore}
            color="#ef4444"
            icon="🍅"
            size="md"
          />
          <p className="text-xs text-[#555] mt-1">35% weight — RT Tomatometer + Metacritic</p>
        </div>

        <div>
          <RankingBar
            label="Audience Score"
            value={audienceScore}
            color="#3b82f6"
            icon="👥"
            size="md"
          />
          <p className="text-xs text-[#555] mt-1">35% weight — IMDb + RT Audience + Metacritic User</p>
        </div>

        <div>
          <RankingBar
            label="Canon Score"
            value={canonScore}
            color="#a855f7"
            icon="🏆"
            size="md"
          />
          <p className="text-xs text-[#555] mt-1">15% weight — Appearances on prestigious film lists</p>
        </div>

        <div>
          <RankingBar
            label="Popularity"
            value={popularityWeight}
            color="#f59e0b"
            icon="🔥"
            size="md"
          />
          <p className="text-xs text-[#555] mt-1">10% weight — Reddit discussion volume and engagement</p>
        </div>

        <div>
          <RankingBar
            label="Longevity Bonus"
            value={longevityBonus}
            color="#22c55e"
            icon="⏳"
            size="md"
          />
          <p className="text-xs text-[#555] mt-1">0–5 flat bonus — Older films still rated highly get a boost</p>
        </div>
      </div>

      {/* Composite score formula */}
      <div className="mt-6 p-4 rounded-lg bg-[#111] border border-[#222] text-xs text-[#555] font-mono">
        <div className="text-[#666] mb-2 font-sans font-medium text-sm">v3 Formula</div>
        <div className="space-y-1">
          <div className="text-[#777] text-xs mb-3">Weighted average (95%):</div>
          <div>
            <span className="text-[#ef4444]">{criticScore.toFixed(1)}</span>
            <span className="text-[#444]"> × 0.35 </span>
          </div>
          <div>
            <span className="text-[#3b82f6]">+ {audienceScore.toFixed(1)}</span>
            <span className="text-[#444]"> × 0.35 </span>
          </div>
          <div>
            <span className="text-[#a855f7]">+ {canonScore.toFixed(1)}</span>
            <span className="text-[#444]"> × 0.15 </span>
          </div>
          <div>
            <span className="text-[#f59e0b]">+ {popularityWeight.toFixed(1)}</span>
            <span className="text-[#444]"> × 0.10 </span>
          </div>
          <div className="text-[#777] text-xs mt-3 mb-1">Plus longevity bonus (flat points):</div>
          <div>
            <span className="text-[#22c55e]">+ {longevityBonus.toFixed(1)}</span>
            <span className="text-[#444]"> (flat 0–5, max score = 100)</span>
          </div>
          <div className="border-t border-[#222] pt-2 mt-2">
            <span className="text-[#f5a623] font-semibold">= {compositeScore.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
