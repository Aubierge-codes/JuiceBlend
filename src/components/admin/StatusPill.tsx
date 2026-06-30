import { Check, Clock, X, Truck, AlertCircle, Package } from "lucide-react";
import { cn } from "@/lib/cn";

type StatusKind =
  | "completed"
  | "pending"
  | "cancelled"
  | "processing"
  | "shipped"
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "active"
  | "inactive";

interface Props {
  status: StatusKind;
  className?: string;
}

const config: Record<StatusKind, { label: string; Icon?: React.ComponentType<{ className?: string }>; classes: string }> = {
  completed:    { label: "Completed",   Icon: Check,        classes: "text-kale-700" },
  active:       { label: "Active",      Icon: Check,        classes: "text-kale-700" },
  in_stock:     { label: "In Stock",    Icon: Check,        classes: "text-kale-700" },
  pending:      { label: "Pending",     Icon: Clock,        classes: "text-amber-700" },
  low_stock:    { label: "Low Stock",   Icon: AlertCircle,  classes: "text-amber-700" },
  processing:   { label: "Processing",  Icon: Package,      classes: "text-info" },
  shipped:      { label: "Shipped",     Icon: Truck,        classes: "text-info" },
  cancelled:    { label: "Cancelled",   Icon: X,            classes: "bg-red-50 text-danger rounded-full px-2.5 py-0.5" },
  out_of_stock: { label: "Out of Stock", Icon: X,           classes: "bg-red-50 text-danger rounded-full px-2.5 py-0.5" },
  inactive:     { label: "Inactive",    Icon: undefined,    classes: "bg-slate-100 text-ink-muted rounded-full px-2.5 py-0.5" },
};

export function StatusPill({ status, className }: Props) {
  const c = config[status];
  const Icon = c.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", c.classes, className)}>
      {Icon && <Icon className="h-3 w-3" />}
      {c.label}
    </span>
  );
}
