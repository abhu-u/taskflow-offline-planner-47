import { useState } from 'react';
import { Calendar, CalendarDays, CalendarRange, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';

export type ViewMode = 'today' | 'week' | 'month' | 'custom';

interface ViewSelectorProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  customRange?: DateRange;
  onCustomRangeChange: (range: DateRange | undefined) => void;
}

const views = [
  { id: 'today' as ViewMode, label: 'Today', icon: Calendar },
  { id: 'week' as ViewMode, label: 'Next 7 Days', icon: CalendarDays },
  { id: 'month' as ViewMode, label: 'Next 30 Days', icon: CalendarRange },
];

export function ViewSelector({ view, onViewChange, customRange, onCustomRangeChange }: ViewSelectorProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      {views.map((v) => {
        const Icon = v.icon;
        return (
          <Button
            key={v.id}
            variant={view === v.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange(v.id)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {v.label}
          </Button>
        );
      })}
      
      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={view === 'custom' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {view === 'custom' && customRange?.from
              ? customRange.to
                ? `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`
                : format(customRange.from, 'MMM d')
              : 'Custom Range'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="range"
            selected={customRange}
            onSelect={(range) => {
              onCustomRangeChange(range);
              if (range?.from && range?.to) {
                onViewChange('custom');
                setDatePickerOpen(false);
              }
            }}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
