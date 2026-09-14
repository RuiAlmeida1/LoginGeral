import type { LucideIcon } from "lucide-react";
export function StatsCard({
  label,
  value,
  detail,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="stats-card">
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">
          {value}
          <span>{detail}</span>
        </strong>
      </div>
      <span className={`stat-icon ${color}`}>
        <Icon size={21} />
      </span>
    </div>
  );
}
