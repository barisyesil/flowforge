import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { processStatusLabels, type ProcessStatus } from "@/types/process";

const styles: Record<ProcessStatus, string> = {
  pending:
    "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  in_progress:
    "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  completed:
    "border-transparent bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  rejected:
    "border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export function StatusBadge({ status }: { status: ProcessStatus }) {
  return (
    <Badge className={cn(styles[status])}>{processStatusLabels[status]}</Badge>
  );
}
