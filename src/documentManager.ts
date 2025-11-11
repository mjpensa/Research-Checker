import * as vscode from 'vscode';

export class DocumentManager {
    /**
     * Prompts user to select research documents
     */
    public async selectDocuments(): Promise<vscode.Uri[]> {
        const uris = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: 'Select Research Documents',
            filters: {
                'Documents': ['txt', 'md', 'pdf', 'docx', 'doc'],
                'Text files': ['txt', 'md'],
                'All files': ['*']
            }
        });

        return uris || [];
    }

    /**
     * Reads content from document URIs
     */
    public async readDocuments(uris: vscode.Uri[]): Promise<string[]> {
        const contents: string[] = [];

        for (const uri of uris) {
            try {
                const content = await this.readDocument(uri);
                contents.push(content);
            } catch (error) {
                const fileName = uri.path.split('/').pop() || 'unknown file';
                vscode.window.showWarningMessage(
                    `Could not read file: ${fileName}. ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }

        return contents;
    }

    /**
     * Reads a single document
     */
    private async readDocument(uri: vscode.Uri): Promise<string> {
        const fileExtension = uri.path.substring(uri.path.lastIndexOf('.')).toLowerCase();

        switch (fileExtension) {
            case '.txt':
            case '.md':
                return await this.readTextFile(uri);
            case '.pdf':
                return await this.readPdfFile(uri);
            case '.doc':
            case '.docx':
                return await this.readWordFile(uri);
            default:
                // Try to read as text
                return await this.readTextFile(uri);
        }
    }

    /**
     * Reads a text file
     */
    private async readTextFile(uri: vscode.Uri): Promise<string> {
        const buffer = await vscode.workspace.fs.readFile(uri);
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(buffer);
    }

    /**
     * Reads a PDF file (basic implementation - extracts text if possible)
     */
    private async readPdfFile(uri: vscode.Uri): Promise<string> {
        // For PDF files, we'll provide instructions to install a PDF parser
        // or read the raw text if available
        const fileName = uri.path.split('/').pop() || 'document.pdf';
        return `[PDF Document: ${fileName}]\nNote: For full PDF text extraction, please convert to .txt or .md format.`;
    }

    /**
     * Reads a Word document (basic implementation)
     */
    private async readWordFile(uri: vscode.Uri): Promise<string> {
        const fileName = uri.path.split('/').pop() || 'document.docx';
        return `[Word Document: ${fileName}]\nNote: For full Word document text extraction, please convert to .txt or .md format.`;
    }

    /**
     * Gets user instructions via input box
     */
    public async getUserInstructions(): Promise<string | undefined> {
        const instructions = await vscode.window.showInputBox({
            prompt: 'Enter instructions for the Gantt chart generation',
            placeHolder: 'e.g., Create an 8-week project plan for developing a mobile app with planning, design, development, and launch phases',
            ignoreFocusOut: true,
            validateInput: (text: string) => {
                return text.trim().length < 10 ? 'Please provide more detailed instructions (at least 10 characters)' : null;
            }
        });

        return instructions;
    }

    /**
     * Shows a multi-line input for more detailed instructions
     */
    public async getDetailedInstructions(): Promise<string | undefined> {
        // Create a new untitled document for instructions
        const doc = await vscode.workspace.openTextDocument({
            content: `# Gantt Chart Generation Instructions

Please provide detailed instructions for generating your Gantt chart.

## Example:
Create a 10-week software development project with:
- Planning phase (weeks 1-2): Requirements gathering, feasibility study
- Design phase (weeks 3-4): UI/UX design, architecture design
- Development phase (weeks 5-8): Frontend, backend, integration
- Testing phase (weeks 9): QA, bug fixes
- Launch phase (week 10): Deployment, documentation

## Your Instructions:
(Write your instructions below this line)

`,
            language: 'markdown'
        });

        await vscode.window.showTextDocument(doc);

        const result = await vscode.window.showInformationMessage(
            'Edit the instructions in the editor, then click Continue',
            { modal: true },
            'Continue',
            'Cancel'
        );

        if (result === 'Continue') {
            const fullText = doc.getText();
            // Extract content after the "Your Instructions:" section
            const match = fullText.match(/## Your Instructions:\s*\(Write your instructions below this line\)\s*\n([\s\S]*)/);
            if (match && match[1].trim()) {
                await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                return match[1].trim();
            }
        }

        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        return undefined;
    }
}
