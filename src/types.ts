export type TimeInterval = 'week' | 'month' | 'quarter' | 'year';

export interface GanttTask {
    name: string;
    startWeek: number;  // Note: "week" is used generically - represents the interval unit
    endWeek: number;    // Note: "week" is used generically - represents the interval unit
}

export interface GanttPhase {
    name: string;
    color: string;
    colorClass: string;
    tasks: GanttTask[];
}

export interface GanttChartData {
    title: string;
    totalWeeks: number;  // Note: "weeks" is used generically - represents total number of intervals
    interval: TimeInterval;  // The actual time unit (week, month, or year)
    phases: GanttPhase[];
}
