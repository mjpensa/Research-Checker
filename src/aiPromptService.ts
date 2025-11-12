import * as vscode from 'vscode';
import { GanttChartData, TimeInterval } from './types';

export class AIPromptService {
    /**
     * Generates a comprehensive prompt for the LLM to create Gantt chart data
     */
    public generatePrompt(userInstructions: string, documentContents: string[], templateImage?: string): string {
        const { interval, totalIntervals } = this.determineInterval(userInstructions, documentContents);
        
    return `You are an expert project manager creating a Gantt chart. Based on the provided research documents and user instructions, generate a structured project timeline.

Your determined interval for this project is "${interval}" with a total of ${totalIntervals} intervals. Please generate the Gantt chart accordingly.

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
  "totalIntervals": ${totalIntervals},
    "interval": "${interval}",
  "phases": [
    {
      "name": "Phase Name",
      "colorClass": "planning",
      "color": "#2196f3",
      "tasks": [
        {
          "name": "Task Name",
          "startInterval": 1,
          "endInterval": 2
        }
      ]
    }
  ]
}

CRITICAL RULES FOR TIME INTERVAL SELECTION (FOLLOW EXACTLY):
1. The "interval" field is MANDATORY and determines how the timeline is displayed
2. Choose "interval" value from: "week", "month", "quarter", or "year"
3. INTERVAL SELECTION LOGIC (STRICTLY ENFORCE):
   
    IF project spans 6+ years (e.g., "2020 to 2030", "10-year plan"):
        → Prefer interval = "year" unless the instructions explicitly require more granularity.
        → SET totalIntervals = number of years (inclusive) (e.g., 2020-2030 → 11)
   
    IF project spans 2–5 years:
        → Prefer interval = "quarter" (each interval = a quarter)
        → SET totalIntervals = number of quarters (years * 4)
        → Example: 3-year roadmap → interval: "quarter", totalIntervals: 12

    IF project spans 9–23 months (or mentions quarters/fiscal quarters):
        → Prefer interval = "month" if month-level detail is needed; else "quarter" if high level.
        → If months explicitly stated (e.g., "18-month") use "month" and totalIntervals = months.

    IF project spans 6–8 months:
        → interval = "month"; totalIntervals = number of months.

    IF project < 6 months or explicitly mentions weeks/sprints:
        → interval = "week"; totalIntervals = number of weeks.

    SPECIAL PHRASES:
        - "quarterly plan" / "Q1", "Q2" references → interval: "quarter" (unless multi-year >5 → year)
        - "fiscal year" with breakdown → likely quarters
        - "multi-year strategic" (>=5 years) → year

4. EXAMPLES TO FOLLOW:
    - "Project from 2020 to 2030" → interval: "year", totalIntervals: 11
    - "10-year transformation" → interval: "year", totalIntervals: 10
    - "3-year roadmap" → interval: "quarter", totalIntervals: 12
    - "18-month development" → interval: "month", totalIntervals: 18
    - "Q1 to Q4 rollout in 2025" → interval: "quarter", totalIntervals: 4
    - "8-week sprint" → interval: "week", totalIntervals: 8

5. IMPORTANT: The "totalIntervals" field name is crucial - it holds the TOTAL NUMBER OF INTERVALS (weeks, months, quarters, or years)
6. IMPORTANT: startInterval and endInterval represent the interval sequence numbers (1..totalIntervals)
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

    private determineInterval(userInstructions: string, documentContents: string[]): { interval: TimeInterval, totalIntervals: number } {
        const combinedText = (userInstructions + ' ' + documentContents.join(' ')).toLowerCase();

        // Check for explicit year-based projects
        const yearMatch = combinedText.match(/(\d{4}) to (\d{4})/);
        if (yearMatch) {
            const startYear = parseInt(yearMatch[1], 10);
            const endYear = parseInt(yearMatch[2], 10);
            const duration = endYear - startYear;
            if (duration > 5) {
                return { interval: 'year', totalIntervals: duration + 1 };
            } else if (duration > 1) {
                return { interval: 'quarter', totalIntervals: duration * 4 };
            }
        }

        const tenYearMatch = combinedText.match(/10-year|ten-year/);
        if (tenYearMatch) {
            return { interval: 'year', totalIntervals: 10 };
        }

        // Check for quarterly projects
        if (combinedText.includes('quarterly') || combinedText.match(/q\d/)) {
            const yearMatch = combinedText.match(/(\d+)\s*year/);
            if (yearMatch) {
                const years = parseInt(yearMatch[1], 10);
                return { interval: 'quarter', totalIntervals: years * 4 };
            }
            return { interval: 'quarter', totalIntervals: 4 }; // Default to 4 quarters
        }

        // Check for monthly projects
        const monthMatch = combinedText.match(/(\d+)\s*month/);
        if (monthMatch) {
            const months = parseInt(monthMatch[1], 10);
            if (months > 12) {
                return { interval: 'quarter', totalIntervals: Math.ceil(months / 3) };
            }
            return { interval: 'month', totalIntervals: months };
        }

        // Default to weeks
        const weekMatch = combinedText.match(/(\d+)\s*week/);
        if (weekMatch) {
            return { interval: 'week', totalIntervals: parseInt(weekMatch[1], 10) };
        }

        return { interval: 'week', totalIntervals: 12 }; // Default
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

        if (!data.totalIntervals || typeof data.totalIntervals !== 'number' || data.totalIntervals < 1) {
            throw new Error('Missing or invalid totalIntervals');
        }

        // Validate interval field
        if (!data.interval) {
            // Default to 'week' for backward compatibility
            data.interval = 'week';
        } else if (!['week', 'month', 'quarter', 'year'].includes(data.interval)) {
            throw new Error(`Invalid interval: ${data.interval}. Must be 'week', 'month', 'quarter', or 'year'`);
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

                if (typeof task.startInterval !== 'number' || task.startInterval < 1 || task.startInterval > data.totalIntervals) {
                    throw new Error(`Invalid startInterval for task ${task.name}: ${task.startInterval}`);
                }

                if (typeof task.endInterval !== 'number' || task.endInterval < task.startInterval || task.endInterval > data.totalIntervals) {
                    throw new Error(`Invalid endInterval for task ${task.name}: ${task.endInterval}`);
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
            const data = this.parseResponse(fullResponse);
            console.log('AI generated data:', JSON.stringify(data, null, 2));
            
            // Post-process: Override interval if AI didn't detect it correctly
            // const correctedData = this.correctIntervalIfNeeded(data, userInstructions, documentContents);
            // console.log('After correction:', JSON.stringify(correctedData, null, 2));
            
            return data;

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
