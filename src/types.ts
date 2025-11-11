export interface GanttTask {
    name: string;
    startWeek: number;
    endWeek: number;
}

export interface GanttPhase {
    name: string;
    color: string;
    colorClass: string;
    tasks: GanttTask[];
}

export interface GanttChartData {
    title: string;
    totalWeeks: number;
    phases: GanttPhase[];
}
