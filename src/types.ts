export type TimeInterval = 'week' | 'month' | 'quarter' | 'year';

export interface GanttTask {
    name: string;
    startInterval: number;
    endInterval: number;
}

export interface GanttPhase {
    name: string;
    color: string;
    colorClass: string;
    tasks: GanttTask[];
}

export interface GanttChartData {
    title: string;
    totalIntervals: number;
    interval: TimeInterval;
    phases: GanttPhase[];
}
