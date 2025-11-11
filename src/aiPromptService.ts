import * as vscode from 'vscode';
import { GanttChartData } from './types';

export class AIPromptService {
    /**
     * Generates a comprehensive prompt for the LLM to create Gantt chart data
     */
    public generatePrompt(userInstructions: string, documentContents: string[], templateImage?: string): string {
        const intervalHint = this.detectIntervalFromPrompt(userInstructions);
        
        return `You are an expert project manager creating a Gantt chart. Based on the provided research documents and user instructions, generate a structured project timeline.

${intervalHint}

TEMPLATE REFERENCE:
The Gantt chart should maintain this exact visual style:
- Clean grid layout with phases and tasks
- Color-coded phases (planning=blue, design=orange, development=red, launch=green, testing=purple, research=gray, deployment=green, review=light-blue)
- Tasks aligned to specific time interval ranges
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
  "interval": "week",
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

CRITICAL RULES FOR TIME INTERVAL SELECTION (FOLLOW EXACTLY):
1. The "interval" field is MANDATORY and determines how the timeline is displayed
2. Choose "interval" value from: "week", "month", or "year"
3. INTERVAL SELECTION LOGIC (STRICTLY ENFORCE):
   
   IF project mentions years (e.g., "2020 to 2030", "10 years", "5-year plan"):
      → SET interval = "year"
      → SET totalWeeks = number of years (e.g., 10 for 2020-2030)
   
   ELSE IF project mentions months (e.g., "18 months", "6-month timeline"):
      → SET interval = "month"
      → SET totalWeeks = number of months
   
   ELSE IF project mentions weeks OR is short-term (< 6 months):
      → SET interval = "week"
      → SET totalWeeks = number of weeks

4. EXAMPLES TO FOLLOW:
   - "Project from 2020 to 2030" → interval: "year", totalWeeks: 11 (2020,2021...2030)
   - "10-year transformation" → interval: "year", totalWeeks: 10
   - "18-month development" → interval: "month", totalWeeks: 18
   - "8-week sprint" → interval: "week", totalWeeks: 8

5. IMPORTANT: The "totalWeeks" field name is misleading - it actually holds the TOTAL NUMBER OF INTERVALS
6. IMPORTANT: startWeek and endWeek represent the interval position numbers (1, 2, 3, etc.)
7. DO NOT default to "week" - analyze the user's request carefully for time indicators

ADDITIONAL RULES:
1. Analyze the documents to identify key project phases and tasks
2. Create realistic timelines based on task complexity and chosen interval
3. Use appropriate phase names and colorClass values: planning, design, development, launch, testing, research, deployment, review
4. Intervals are numbered starting from 1
5. Tasks can overlap within and across phases
6. Each phase should have 2-5 tasks typically
7. Total intervals should be appropriate for the project scope
8. Task names should be clear and action-oriented
9. Consider dependencies and logical sequencing
10. Ensure the interval choice makes the chart readable (typically 8-50 intervals total)

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

        // Validate interval field
        if (!data.interval) {
            // Default to 'week' for backward compatibility
            data.interval = 'week';
        } else if (!['week', 'month', 'year'].includes(data.interval)) {
            throw new Error(`Invalid interval: ${data.interval}. Must be 'week', 'month', or 'year'`);
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
     * Detects the appropriate interval from the user's prompt
     */
    private detectIntervalFromPrompt(userInstructions: string): string {
        const lowerInstructions = userInstructions.toLowerCase();
        
        // Check for year indicators
        const yearPatterns = [
            /(\d+)\s*-?\s*year/i,
            /\b(20\d{2})\s+to\s+(20\d{2})/i,
            /\b(20\d{2})\s*-\s*(20\d{2})/i,
            /decade/i,
            /long-?term/i,
            /strategic/i
        ];
        
        for (const pattern of yearPatterns) {
            if (pattern.test(lowerInstructions)) {
                return '⚠️ DETECTED: This appears to be a MULTI-YEAR project. You MUST set interval="year"';
            }
        }
        
        // Check for month indicators
        const monthPatterns = [
            /(\d+)\s*-?\s*month/i,
            /quarter/i,
            /fiscal\s+year/i
        ];
        
        for (const pattern of monthPatterns) {
            if (pattern.test(lowerInstructions)) {
                return '⚠️ DETECTED: This appears to be a MONTHLY project. You MUST set interval="month"';
            }
        }
        
        // Check for week indicators
        const weekPatterns = [
            /(\d+)\s*-?\s*week/i,
            /sprint/i,
            /iteration/i
        ];
        
        for (const pattern of weekPatterns) {
            if (pattern.test(lowerInstructions)) {
                return '⚠️ DETECTED: This appears to be a WEEKLY project. You MUST set interval="week"';
            }
        }
        
        return '';
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

        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error) {
                // This is a LanguageModelError
                const lmError = error as vscode.LanguageModelError;
                throw new Error(`Language model error: ${lmError.message}`);
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown error occurred during AI generation');
        }
    }
}
