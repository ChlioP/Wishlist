import type { StatCardProps } from "@/components/dashboard/StatCard";
import { StatCard } from "@/components/dashboard/StatCard";

interface StatsGridProps {
  stats: StatCardProps[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section
      aria-label="Dashboard statistics"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}
