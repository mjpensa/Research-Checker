import * as vscode from 'vscode';
import { GanttChartGenerator } from './ganttGenerator';
import { AIPromptService } from './aiPromptService';
import { DocumentManager } from './documentManager';
import { GanttChartPanel } from './ganttPanel';
import { GanttChartData } from './types';

export function activate(context: vscode.ExtensionContext) {
    console.log('Gantt Chart Generator extension is now active');

    // Register the main command
    const generateCommand = vscode.commands.registerCommand('gantt-chart.generate', async () => {
        await generateGanttChart(context);
    });

    context.subscriptions.push(generateCommand);
}

async function generateGanttChart(context: vscode.ExtensionContext) {
    const documentManager = new DocumentManager();
    const aiService = new AIPromptService();
    const generator = new GanttChartGenerator();

    try {
        // Step 1: Get user instructions
        vscode.window.showInformationMessage('Starting Gantt Chart Generation...');

        const instructionChoice = await vscode.window.showQuickPick(
            ['Quick Instructions', 'Detailed Instructions (Editor)'],
            {
                placeHolder: 'How would you like to provide instructions?'
            }
        );

        if (!instructionChoice) {
            return;
        }

        let userInstructions: string | undefined;
        if (instructionChoice === 'Quick Instructions') {
            userInstructions = await documentManager.getUserInstructions();
        } else {
            userInstructions = await documentManager.getDetailedInstructions();
        }

        if (!userInstructions) {
            vscode.window.showErrorMessage('No instructions provided. Gantt chart generation cancelled.');
            return;
        }

        // Step 2: Select research documents (optional)
        const selectDocs = await vscode.window.showQuickPick(
            ['Yes', 'No'],
            {
                placeHolder: 'Would you like to include research documents?'
            }
        );

        let documentContents: string[] = [];
        if (selectDocs === 'Yes') {
            const documentUris = await documentManager.selectDocuments();
            if (documentUris.length > 0) {
                await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: 'Reading documents...',
                        cancellable: false
                    },
                    async () => {
                        documentContents = await documentManager.readDocuments(documentUris);
                    }
                );
            }
        }

        // Step 3: Generate Gantt chart using AI
        let ganttData: GanttChartData;
        
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Gantt chart with AI...',
                cancellable: false
            },
            async () => {
                ganttData = await aiService.generateGanttChart(userInstructions!, documentContents);
            }
        );

        // Step 4: Generate HTML
        const htmlContent = generator.generateHTML(ganttData!);

        // Step 5: Display in webview
        GanttChartPanel.createOrShow(context.extensionUri, htmlContent, ganttData!.title);

        // Step 6: Ask if user wants to save
        const saveChoice = await vscode.window.showInformationMessage(
            'Gantt chart generated successfully! Would you like to save it as an HTML file?',
            'Save',
            'No'
        );

        if (saveChoice === 'Save') {
            await saveGanttChart(htmlContent, ganttData!.title);
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        vscode.window.showErrorMessage(`Failed to generate Gantt chart: ${errorMessage}`);
        console.error('Gantt chart generation error:', error);
    }
}

async function saveGanttChart(htmlContent: string, defaultTitle: string) {
    const fileName = defaultTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html';
    
    const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(fileName),
        filters: {
            'HTML Files': ['html']
        }
    });

    if (uri) {
        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(uri, encoder.encode(htmlContent));
        vscode.window.showInformationMessage(`Gantt chart saved to ${uri.fsPath}`);
        
        // Ask if user wants to open the file
        const openChoice = await vscode.window.showInformationMessage(
            'Would you like to open the saved file?',
            'Open',
            'No'
        );

        if (openChoice === 'Open') {
            await vscode.commands.executeCommand('vscode.open', uri);
        }
    }
}

export function deactivate() {}
