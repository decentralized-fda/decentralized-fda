'use client'

import React, { useState, useEffect } from 'react'
import { RRule, rrulestr, Weekday, type Options as RRuleOptions } from 'rrule'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar" // Assuming Shadcn calendar
import { Switch } from "@/components/ui/switch"
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { TimeSelector } from "./time-selector" // Use local import
import { VARIABLE_CATEGORY_IDS } from '@/lib/constants/variable-categories'; // Import category IDs
// import { TimeField } from "@/components/ui/time-field" // Commented out - Component not found
// import { type RRuleOption, getRRuleOptions } from "@/lib/rrule-options" // Commented out - Module not found

// Define the structure of the schedule object this component works with
export interface ReminderScheduleData {
  rruleString: string; // The generated RRULE string
  timeOfDay: string; // HH:mm format (e.g., "09:00")
  // timezone: string; // Removed
  startDate: Date;
  endDate?: Date | null;
  isActive: boolean;
  default_value?: number | null; // Optional default dosage/measurement value
}

interface ReminderSchedulerProps {
  initialSchedule?: Partial<ReminderScheduleData>; // Allow passing partial initial state
  onChange: (schedule: ReminderScheduleData) => void;
  userTimezone: string; // <-- Accept user timezone as prop
  unitName?: string; // Optional unit for the default value
  variableName?: string; // Name of the variable
  variableCategoryId?: string; // Add category ID prop
}

export function ReminderScheduler({ 
  initialSchedule, 
  onChange, 
  userTimezone,
  unitName,
  variableName,
  variableCategoryId // Receive category ID prop
}: ReminderSchedulerProps) {
  const [freq, setFreq] = useState<number>(RRule.DAILY); // Default to Daily
  const [interval, setInterval] = useState<number>(1);
  const [byWeekday, setByWeekday] = useState<Weekday[]>([]); // For weekly
  const [byMonthDay, setByMonthDay] = useState<number | null>(null); // For monthly
  const [timeOfDay, setTimeOfDay] = useState<string>(initialSchedule?.timeOfDay || "09:00");
  // const [timezone, setTimezone] = useState<string>(...); // Removed timezone state
  const [startDate, setStartDate] = useState<Date>(initialSchedule?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date | null | undefined>(initialSchedule?.endDate);
  const [isActive, setIsActive] = useState<boolean>(initialSchedule?.isActive === undefined ? true : initialSchedule.isActive);
  const [defaultValue, setDefaultValue] = useState<number | null | undefined>(initialSchedule?.default_value);

  // --- Helper to generate RRuleString --- // Renamed and simplified
  const generateRRuleString = (currentOptions: { 
      freq: number;
      interval: number;
      byWeekday: Weekday[];
      byMonthDay: number | null;
      startDate: Date;
      endDate?: Date | null;
      userTimezone: string;
  }): string => {
      const options: Partial<RRuleOptions> = {
          freq: currentOptions.freq,
          interval: currentOptions.interval,
          dtstart: currentOptions.startDate,
          tzid: currentOptions.userTimezone,
      };
      if (currentOptions.freq === RRule.WEEKLY && currentOptions.byWeekday.length > 0) {
          options.byweekday = currentOptions.byWeekday;
      } else if (currentOptions.freq === RRule.MONTHLY && currentOptions.byMonthDay !== null) {
          options.bymonthday = currentOptions.byMonthDay;
      }
      if (currentOptions.endDate) {
          const endOfDayEndDate = new Date(currentOptions.endDate);
          endOfDayEndDate.setHours(23, 59, 59, 999);
          options.until = endOfDayEndDate;
      }
      return new RRule(options).toString();
  };

  // --- Helper to notify parent with complete data --- // Renamed and simplified
  const triggerOnChange = (updatedState: { // Takes the full state object
    freq: number;
    interval: number;
    byWeekday: Weekday[];
    byMonthDay: number | null;
    timeOfDay: string;
    startDate: Date;
    endDate?: Date | null;
    isActive: boolean;
    defaultValue?: number | null;
  }) => {
    const rruleString = generateRRuleString({
        ...updatedState,
        userTimezone: userTimezone, // Add timezone here
    });

    onChange({
        rruleString,
        timeOfDay: updatedState.timeOfDay,
        startDate: updatedState.startDate,
        endDate: updatedState.endDate,
        isActive: updatedState.isActive,
        default_value: updatedState.defaultValue || null,
    });
  };

  // --- Update internal state from RRULE string on initial load/change ---
  useEffect(() => {
      if (initialSchedule?.rruleString) {
          try {
              // RRULE string itself doesn't usually contain timezone, 
              // it's interpreted based on DTSTART timezone.
              // We now get timezone context from the userTimezone prop.
              const rule = rrulestr(initialSchedule.rruleString) as RRule;
              if (rule.options.freq !== undefined) setFreq(rule.options.freq);
              if (rule.options.interval !== undefined) setInterval(rule.options.interval);
              
              // Safely handle byweekday conversion
              if (rule.options.byweekday !== undefined && rule.options.byweekday !== null) {
                   const rawWeekdaysSource = rule.options.byweekday;
                   const rawWeekdays = Array.isArray(rawWeekdaysSource) ? rawWeekdaysSource : [rawWeekdaysSource];
                   const weekdays: Weekday[] = rawWeekdays
                      .map(d => {
                          // Check if it's already a Weekday object (has .weekday property)
                          if (typeof d === 'object' && d !== null && 'weekday' in d && typeof (d as any).weekday === 'number') {
                              // It looks like a Weekday object, create a new instance to be safe
                              // Or just return d if you are sure about the source integrity 
                              return new Weekday((d as any).weekday, (d as any).n);
                          }
                          // Otherwise, assume it's a number and create a new Weekday
                          if (typeof d === 'number') {
                             return new Weekday(d);
                          }
                          console.warn("Unexpected type in byweekday array:", d);
                          return null; // Explicitly return null for invalid types
                      })
                      .filter((d): d is Weekday => d !== null); // Type guard to filter out nulls

                   setByWeekday(weekdays);
              } else {
                   setByWeekday([]);
              }
              
              if (rule.options.bymonthday !== undefined && typeof rule.options.bymonthday === 'number') {
                   setByMonthDay(rule.options.bymonthday);
              } else {
                   setByMonthDay(null);
              }
          } catch (e) {
              console.error("Error parsing initial RRULE string:", e);
              // Reset to defaults if parse fails
              setFreq(RRule.DAILY);
              setInterval(1);
              setByWeekday([]);
              setByMonthDay(null);
          }
      }
       // Also update other fields from initialSchedule if they change
      const initialTime = initialSchedule?.timeOfDay || "09:00";
      // Ensure time is always HH:mm
      setTimeOfDay(initialTime.substring(0, 5)); 
      // setTimezone(...) // Removed
      setStartDate(initialSchedule?.startDate || new Date());
      setEndDate(initialSchedule?.endDate);
      setIsActive(initialSchedule?.isActive === undefined ? true : initialSchedule.isActive);
      setDefaultValue(initialSchedule?.default_value);

      // Include all dependencies
  }, [initialSchedule?.rruleString, initialSchedule?.timeOfDay, initialSchedule?.startDate, initialSchedule?.endDate, initialSchedule?.isActive, initialSchedule?.default_value]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Linter seems confused, function is used below
  const handleWeekdayChange = (day: Weekday, checked: boolean | string) => {
      if (checked === true) {
          // Ensure weekdays are sorted for consistent RRULE string
          setByWeekday([...byWeekday, day].sort((a, b) => a.weekday - b.weekday));
      } else {
          setByWeekday(byWeekday.filter(d => d.weekday !== day.weekday));
      }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
        {/* Frequency */}
        <div className="grid grid-cols-3 gap-4 items-center">
            <Label htmlFor="freq" className="col-span-1">Frequency</Label>
            <Select 
                value={freq.toString()} 
                onValueChange={(v) => {
                    const newFreq = parseInt(v);
                    const newByWeekday = newFreq !== RRule.WEEKLY ? [] : byWeekday;
                    const newByMonthDay = newFreq !== RRule.MONTHLY ? null : byMonthDay;
                    setFreq(newFreq);
                    setByWeekday(newByWeekday);
                    setByMonthDay(newByMonthDay);
                    triggerOnChange({ // Pass the complete next state
                        freq: newFreq, 
                        interval, 
                        byWeekday: newByWeekday, 
                        byMonthDay: newByMonthDay, 
                        timeOfDay, 
                        startDate, 
                        endDate, 
                        isActive, 
                        defaultValue
                    });
                }}
            >
                <SelectTrigger id="freq" className="col-span-2">
                    <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={RRule.DAILY.toString()}>Daily</SelectItem>
                    <SelectItem value={RRule.WEEKLY.toString()}>Weekly</SelectItem>
                    <SelectItem value={RRule.MONTHLY.toString()}>Monthly</SelectItem>
                    {/* <SelectItem value={RRule.YEARLY.toString()}>Yearly</SelectItem> */}
                </SelectContent>
            </Select>
        </div>

        {/* Interval - Conditionally render based on category */}
        {variableCategoryId !== VARIABLE_CATEGORY_IDS.HEALTH_AND_PHYSIOLOGY && (
          <div className="grid grid-cols-3 gap-4 items-center">
              <Label htmlFor="interval" className="col-span-1">Repeat Every</Label>
              <div className="col-span-2 flex items-center gap-2">
                <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => {
                        const newInterval = Math.max(1, parseInt(e.target.value) || 1);
                        setInterval(newInterval);
                        triggerOnChange({ // Pass the complete next state
                            freq, 
                            interval: newInterval, 
                            byWeekday, 
                            byMonthDay, 
                            timeOfDay, 
                            startDate, 
                            endDate, 
                            isActive, 
                            defaultValue
                        });
                    }}
                    className="w-[70px]"
                />
                <span>
                    {freq === RRule.DAILY && (interval === 1 ? "day" : "days")}
                    {freq === RRule.WEEKLY && (interval === 1 ? "week" : "weeks")}
                    {freq === RRule.MONTHLY && (interval === 1 ? "month" : "months")}
                </span>
              </div>
          </div>
        )}

        {/* Repeat On (Weekly) */}
        {freq === RRule.WEEKLY && (
            <div className="grid grid-cols-3 gap-4">
                <Label className="col-span-1 pt-2">Repeat On</Label>
                <div className="col-span-2 grid grid-cols-4 gap-2">
                    {[RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU].map((day) => (
                        <div key={day.weekday} className="flex items-center space-x-2">
                           <Checkbox
                                id={`weekday-${day.weekday}`}
                                checked={byWeekday.some(d => d.weekday === day.weekday)}
                                onCheckedChange={(checked) => {
                                    let newByWeekday: Weekday[];
                                    if (checked === true) {
                                        newByWeekday = [...byWeekday, day].sort((a, b) => a.weekday - b.weekday);
                                    } else {
                                        newByWeekday = byWeekday.filter(d => d.weekday !== day.weekday);
                                    }
                                    setByWeekday(newByWeekday);
                                    triggerOnChange({ // Pass the complete next state
                                        freq, 
                                        interval, 
                                        byWeekday: newByWeekday, 
                                        byMonthDay, 
                                        timeOfDay, 
                                        startDate, 
                                        endDate, 
                                        isActive, 
                                        defaultValue
                                    });
                                }}
                            />
                            <Label htmlFor={`weekday-${day.weekday}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                {day.toString()} 
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        )}

         {/* Repeat On Day (Monthly) */} 
         {freq === RRule.MONTHLY && (
            <div className="grid grid-cols-3 gap-4 items-center">
                <Label htmlFor="bymonthday" className="col-span-1">Day of Month</Label>
                 <Select 
                    value={byMonthDay?.toString() || ""} 
                    onValueChange={(v) => {
                        const newMonthDay = v ? parseInt(v) : null;
                        setByMonthDay(newMonthDay);
                        triggerOnChange({ // Pass the complete next state
                            freq, 
                            interval, 
                            byWeekday, 
                            byMonthDay: newMonthDay, 
                            timeOfDay, 
                            startDate, 
                            endDate, 
                            isActive, 
                            defaultValue
                        });
                    }}
                 >
                    <SelectTrigger id="bymonthday" className="col-span-2">
                        <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
         )}

        {/* Time of Day */}
        <div className="grid grid-cols-3 gap-4 items-center">
             <Label htmlFor="timeOfDay" className="col-span-1">Time of Day</Label>
             <div className="col-span-2">
                <TimeSelector 
                  value={timeOfDay} 
                  onChange={(newTime) => {
                      setTimeOfDay(newTime);
                      triggerOnChange({ // Pass the complete next state
                          freq, 
                          interval, 
                          byWeekday, 
                          byMonthDay, 
                          timeOfDay: newTime, 
                          startDate, 
                          endDate, 
                          isActive, 
                          defaultValue
                      });
                  }} 
                  label="" 
                />
             </div>
        </div>

        {/* Start Date */} 
        <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="col-span-1">Start Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-full col-span-2 justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")} 
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                            if (date) {
                                setStartDate(date);
                                triggerOnChange({ // Pass the complete next state
                                    freq, 
                                    interval, 
                                    byWeekday, 
                                    byMonthDay, 
                                    timeOfDay, 
                                    startDate: date, 
                                    endDate, 
                                    isActive, 
                                    defaultValue
                                });
                            }
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>

        {/* End Date (Optional) */} 
        <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="col-span-1">End Date</Label>
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-full col-span-2 justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Never</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                     <Calendar
                        mode="single"
                        selected={endDate || undefined}
                        onSelect={(date) => {
                            const newEndDate = date instanceof Date ? date : null; // Can be null if cleared
                            setEndDate(newEndDate);
                            triggerOnChange({ // Pass the complete next state
                                freq, 
                                interval, 
                                byWeekday, 
                                byMonthDay, 
                                timeOfDay, 
                                startDate, 
                                endDate: newEndDate, 
                                isActive, 
                                defaultValue
                            });
                        }} 
                    />
                    <div className="p-2 border-t">
                        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => {
                            setEndDate(null);
                            triggerOnChange({ // Pass the complete next state
                                freq, 
                                interval, 
                                byWeekday, 
                                byMonthDay, 
                                timeOfDay, 
                                startDate, 
                                endDate: null, 
                                isActive, 
                                defaultValue
                            });
                        }}>Set to Never</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>

        {/* Is Active */}
        <div className="flex items-center space-x-2">
            <Switch 
                id="is-active" 
                checked={isActive} 
                onCheckedChange={(newIsActive) => {
                    setIsActive(newIsActive);
                    triggerOnChange({ // Pass the complete next state
                        freq, 
                        interval, 
                        byWeekday, 
                        byMonthDay, 
                        timeOfDay, 
                        startDate, 
                        endDate, 
                        isActive: newIsActive, 
                        defaultValue
                    });
                }} 
            />
            <Label htmlFor="is-active">Reminder Active</Label>
        </div>

        {/* Default Value (optional) - Conditionally render based on unitName */}
        {unitName && unitName !== 'bool' && (
          <div className="grid grid-cols-3 gap-4 items-center">
              <Label htmlFor="default-value" className="col-span-1">
                Default {variableName ? 'Value for ' + variableName : 'Value'} 
              </Label>
              <div className="col-span-2 flex items-center gap-2">
                <Input
                  id="default-value"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Enter amount"
                  value={defaultValue?.toString() || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : null;
                    setDefaultValue(value);
                    triggerOnChange({ // Pass the complete next state
                        freq, 
                        interval, 
                        byWeekday, 
                        byMonthDay, 
                        timeOfDay, 
                        startDate, 
                        endDate, 
                        isActive, 
                        defaultValue: value
                    });
                  }}
                  className="flex-grow"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">{unitName}</span>
              </div>
          </div>
        )}
    </div>
  );
} 