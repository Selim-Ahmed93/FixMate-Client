import { BadgeCheck, Clock3, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import type { ApprovalStatus } from "@/lib/types";

const approvalConfig: Record<
  ApprovalStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-900",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: BadgeCheck,
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    icon: XCircle,
  },
};

export function ServiceApprovalBadge({
  status,
  className,
}: {
  status: ApprovalStatus;
  className?: string;
}) {
  const { label, className: tone, icon: Icon } = approvalConfig[status];

  return (
    <Badge variant="outline" className={cn(tone, className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
