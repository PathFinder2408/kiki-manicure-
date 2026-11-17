import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMonthBounds, shiftMonthKey } from "@/lib/dateUtils";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (monthKey: string) => void;
}

export const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  const { label } = getMonthBounds(selectedMonth);

  return (
    <div className="inline-flex items-center justify-between gap-1 bg-card border border-border rounded-2xl px-1.5 py-1 shadow-sm w-full sm:w-auto">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-xl shrink-0"
        onClick={() => onMonthChange(shiftMonthKey(selectedMonth, -1))}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1.5 px-2 text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>{label}</span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-xl shrink-0"
        onClick={() => onMonthChange(shiftMonthKey(selectedMonth, 1))}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
