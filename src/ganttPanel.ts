import * as vscode from 'vscode';
import { GanttChartData } from './types';

export class GanttChartPanel {
    public static currentPanel: GanttChartPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, private extensionUri: vscode.Uri) {
        this.panel = panel;

        // Handle panel disposal
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }

    public static createOrShow(extensionUri: vscode.Uri, htmlContent: string, title: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (GanttChartPanel.currentPanel) {
            GanttChartPanel.currentPanel.panel.reveal(column);
            GanttChartPanel.currentPanel.update(htmlContent);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'ganttChart',
            title,
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        GanttChartPanel.currentPanel = new GanttChartPanel(panel, extensionUri);
        GanttChartPanel.currentPanel.update(htmlContent);
    }

    public update(htmlContent: string) {
        this.panel.webview.html = htmlContent;
    }

    public dispose() {
        GanttChartPanel.currentPanel = undefined;

        this.panel.dispose();

        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
