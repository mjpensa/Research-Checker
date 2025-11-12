import { GanttChartData, GanttPhase, GanttTask, TimeInterval } from './types';

export class GanttChartGenerator {
    private readonly colorScheme = {
        planning: { color: '#2196f3', headerColor: '#1976d2' },
        design: { color: '#ff9800', headerColor: '#f57c00' },
        development: { color: '#ff5722', headerColor: '#ff5722' },
        launch: { color: '#00bfa5', headerColor: '#00bfa5' },
        testing: { color: '#9c27b0', headerColor: '#7b1fa2' },
        research: { color: '#607d8b', headerColor: '#455a64' },
        deployment: { color: '#4caf50', headerColor: '#388e3c' },
        review: { color: '#03a9f4', headerColor: '#0288d1' }
    };

    public generateHTML(data: GanttChartData): string {
    const intervals = this.generateIntervalHeaders(data.totalWeeks, data.interval);
    const phaseRows = data.phases.map(phase => this.generatePhaseRows(phase, data.totalWeeks, data.interval)).join('\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(data.title)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }

        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: ${Math.max(1400, 250 + data.totalWeeks * 100)}px;
            margin: 0 auto;
        }

        h1 {
            text-align: center;
            color: #5a5a5a;
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 40px;
        }

        .gantt-chart {
            display: grid;
            grid-template-columns: 250px repeat(${data.totalWeeks}, 1fr);
            gap: 0;
            border: 1px solid #ddd;
        }

        .header-cell {
            background: #e3f2fd;
            padding: 15px;
            text-align: center;
            font-weight: 600;
            color: #1976d2;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
        }

        .phase-header {
            background: #d0d0d0;
            padding: 15px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 14px;
            color: #666;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            grid-column: span ${data.totalWeeks + 1};
        }

        .task-cell {
            background: white;
            padding: 15px;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }

        .week-cell {
            background: #fafafa;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            position: relative;
            min-height: 50px;
            padding: 10px 5px;
        }

        .bar {
            height: 30px;
            border-radius: 4px;
            width: 100%;
        }

        ${this.generateColorStyles()}
    </style>
</head>
<body>
    <div class="container">
        <h1>${this.escapeHtml(data.title)}</h1>
        
        <div class="gantt-chart">
            <!-- Header Row -->
            <div class="header-cell" style="background: #d0d0d0;"></div>
            ${intervals}

            ${phaseRows}
        </div>
    </div>
</body>
</html>`;
    }

    private generateIntervalHeaders(totalIntervals: number, interval: TimeInterval): string {
        let headers = '';
        const prefix = this.getIntervalPrefix(interval);
        
        for (let i = 1; i <= totalIntervals; i++) {
            headers += `<div class="header-cell">${prefix}${i}</div>\n            `;
        }
        return headers.trim();
    }

    private getIntervalPrefix(interval: TimeInterval | string): string {
        switch (interval) {
            case 'week':
                return 'W';
            case 'month':
                return 'M';
            case 'quarter':
                return 'Q';
            case 'year':
                return 'Y';
            default:
                return 'I';
        }
    }

    private generatePhaseRows(phase: GanttPhase, totalWeeks: number, interval: TimeInterval): string {
        const colorKey = this.getColorKey(phase.colorClass);
        const colors = this.colorScheme[colorKey] || this.colorScheme.planning;
        
        let html = `            <!-- ${phase.name} Phase -->\n`;
        html += `            <div class="phase-header" style="color: ${colors.headerColor};">${this.escapeHtml(phase.name.toUpperCase())}</div>\n`;

        for (const task of phase.tasks) {
            html += `\n            <!-- ${task.name} -->\n`;
            html += `            <div class="task-cell">${this.escapeHtml(task.name)}</div>\n`;
            
            for (let week = 1; week <= totalWeeks; week++) {
                const hasBar = week >= task.startWeek && week <= task.endWeek;
                if (hasBar) {
                    html += `            <div class="week-cell" title="${this.escapeHtml(task.name)} (${this.getIntervalPrefix(interval)}${task.startWeek}-${this.getIntervalPrefix(interval)}${task.endWeek})"><div class="bar ${phase.colorClass}"></div></div>\n`;
                } else {
                    html += `            <div class="week-cell"></div>\n`;
                }
            }
        }

        return html;
    }

    private generateColorStyles(): string {
        let styles = '';
        for (const [key, value] of Object.entries(this.colorScheme)) {
            styles += `        .bar.${key} {\n            background: ${value.color};\n        }\n\n`;
            styles += `        .phase-header.${key} {\n            color: ${value.headerColor};\n        }\n\n`;
        }
        return styles;
    }

    private getColorKey(colorClass: string): keyof typeof this.colorScheme {
        const normalized = colorClass.toLowerCase();
        if (normalized in this.colorScheme) {
            return normalized as keyof typeof this.colorScheme;
        }
        return 'planning';
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
