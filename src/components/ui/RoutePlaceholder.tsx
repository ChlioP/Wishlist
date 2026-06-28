import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface RoutePlaceholderProps {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function RoutePlaceholder({
  description,
  icon,
  title,
}: RoutePlaceholderProps) {
  return (
    <Card padding="none">
      <EmptyState description={description} icon={icon} title={title} />
    </Card>
  );
}
