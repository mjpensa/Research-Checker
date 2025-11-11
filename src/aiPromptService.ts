import * as vscode from 'vscode';
import { GanttChartData } from './types';

export class AIPromptService {
    /**
     * Generates a comprehensive prompt for the LLM to create Gantt chart data
     */
    public generatePrompt(userInstructions: string, documentContents: string[], templateImage?: string): string {
        return `You are an expert project manager creating a Gantt chart. Based on the provided research documents and user instructions, generate a structured project timeline.

TEMPLATE REFERENCE:
The Gantt chart should maintain this exact visual style:
- Clean grid layout with phases and tasks
- Color-coded phases (planning=blue, design=orange, development=red, launch=green, testing=purple, research=gray, deployment=green, review=light-blue)
- Tasks aligned to specific week ranges
- Professional business aesthetic

USER INSTRUCTIONS:
${userInstructions}

RESEARCH DOCUMENTS:
${this.formatDocuments(documentContents)}

OUTPUT FORMAT:
You must respond with ONLY valid JSON matching this exact structure (no additional text):

{
  "title": "Project Title Here",
  "totalWeeks": 8,
  "phases": [
    {
      "name": "Phase Name",
      "colorClass": "planning",
      "color": "#2196f3",
      "tasks": [
        {
          "name": "Task Name",
          "startWeek": 1,
          "endWeek": 2
        }
      ]
    }
  ]
}

RULES:
1. Analyze the documents to identify key project phases and tasks
2. Create realistic timelines based on task complexity
3. Use appropriate phase names and colorClass values: planning, design, development, launch, testing, research, deployment, review
4. Weeks are numbered starting from 1
5. Tasks can overlap within and across phases
6. Each phase should have 2-5 tasks typically
7. Total weeks should be appropriate for the project scope (typically 4-12 weeks)
8. Task names should be clear and action-oriented
9. Consider dependencies and logical sequencing

Generate the Gantt chart data now:`;
    }

    /**
     * Parses the LLM response and validates the structure
     */
    public parseResponse(response: string): GanttChartData {
        try {
            // Try to extract JSON from markdown code blocks if present
            let jsonText = response.trim();
            const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonText = jsonMatch[1];
            } else {
                // Try to find JSON object in the response
                const objectMatch = jsonText.match(/\{[\s\S]*\}/);
                if (objectMatch) {
                    jsonText = objectMatch[0];
                }
            }

            const data = JSON.parse(jsonText) as GanttChartData;

            // Validate the structure
            this.validateGanttData(data);

            return data;
        } catch (error) {
            throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validates the Gantt chart data structure
     */
    private validateGanttData(data: any): asserts data is GanttChartData {
        if (!data.title || typeof data.title !== 'string') {
            throw new Error('Missing or invalid title');
        }

        if (!data.totalWeeks || typeof data.totalWeeks !== 'number' || data.totalWeeks < 1) {
            throw new Error('Missing or invalid totalWeeks');
        }

        if (!Array.isArray(data.phases) || data.phases.length === 0) {
            throw new Error('Missing or invalid phases array');
        }

        for (const phase of data.phases) {
            if (!phase.name || typeof phase.name !== 'string') {
                throw new Error(`Invalid phase name: ${JSON.stringify(phase)}`);
            }

            if (!phase.colorClass || typeof phase.colorClass !== 'string') {
                throw new Error(`Invalid colorClass for phase: ${phase.name}`);
            }

            if (!Array.isArray(phase.tasks) || phase.tasks.length === 0) {
                throw new Error(`Phase ${phase.name} has no tasks`);
            }

            for (const task of phase.tasks) {
                if (!task.name || typeof task.name !== 'string') {
                    throw new Error(`Invalid task name in phase ${phase.name}`);
                }

                if (typeof task.startWeek !== 'number' || task.startWeek < 1 || task.startWeek > data.totalWeeks) {
                    throw new Error(`Invalid startWeek for task ${task.name}: ${task.startWeek}`);
                }

                if (typeof task.endWeek !== 'number' || task.endWeek < task.startWeek || task.endWeek > data.totalWeeks) {
                    throw new Error(`Invalid endWeek for task ${task.name}: ${task.endWeek}`);
                }
            }
        }
    }

    /**
     * Formats document contents for the prompt
     */
    private formatDocuments(documents: string[]): string {
        if (documents.length === 0) {
            return '(No documents provided)';
        }

        return documents.map((doc, index) => {
            return `--- Document ${index + 1} ---\n${doc}\n`;
        }).join('\n');
    }

    /**
     * Calls the language model (GitHub Copilot Chat API)
     */
    public async generateGanttChart(
        userInstructions: string,
        documentContents: string[],
        templateImage?: string
    ): Promise<GanttChartData> {
        try {
            // Get available language models
            const models = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: 'gpt-4o'
            });

            if (models.length === 0) {
                throw new Error('No language models available. Please ensure GitHub Copilot is enabled.');
            }

            const model = models[0];
            const prompt = this.generatePrompt(userInstructions, documentContents, templateImage);

            // Create chat messages
            const messages = [
                vscode.LanguageModelChatMessage.User(prompt)
            ];

            // Send request to the model
            const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

            // Collect the response
            let fullResponse = '';
            for await (const chunk of response.text) {
                fullResponse += chunk;
            }

            // Parse and return the result
            return this.parseResponse(fullResponse);

        } catch (error) {
            if (error instanceof vscode.LanguageModelError) {
                throw new Error(`Language model error: ${error.message}`);
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown error occurred during AI generation');
        }
    }
}
