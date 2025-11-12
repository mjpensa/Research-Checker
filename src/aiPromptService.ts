import * as vscode from 'vscode';
import { GanttChartData } from './types';

export class AIPromptService {
    /**
     * Generates a comprehensive prompt for the LLM to create Gantt chart data
     */
    public generatePrompt(userInstructions: string, documentContents: string[], templateImage?: string): string {
        const intervalHint = this.detectIntervalFromInputs(userInstructions, documentContents);
        
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
2. Choose "interval" value from: "week", "month", "quarter", or "year"
3. INTERVAL SELECTION LOGIC (STRICTLY ENFORCE):
   
    IF project spans 6+ years (e.g., "2020 to 2030", "10-year plan"):
        → Prefer interval = "year" unless the instructions explicitly require more granularity.
        → SET totalWeeks = number of years (inclusive) (e.g., 2020-2030 → 11)
   
    IF project spans 2–5 years:
        → Prefer interval = "quarter" (each interval = a quarter)
        → SET totalWeeks = number of quarters (years * 4)
        → Example: 3-year roadmap → interval: "quarter", totalWeeks: 12

    IF project spans 9–23 months (or mentions quarters/fiscal quarters):
        → Prefer interval = "month" if month-level detail is needed; else "quarter" if high level.
        → If months explicitly stated (e.g., "18-month") use "month" and totalWeeks = months.

    IF project spans 6–8 months:
        → interval = "month"; totalWeeks = number of months.

    IF project < 6 months or explicitly mentions weeks/sprints:
        → interval = "week"; totalWeeks = number of weeks.

    SPECIAL PHRASES:
        - "quarterly plan" / "Q1", "Q2" references → interval: "quarter" (unless multi-year >5 → year)
        - "fiscal year" with breakdown → likely quarters
        - "multi-year strategic" (>=5 years) → year

4. EXAMPLES TO FOLLOW:
    - "Project from 2020 to 2030" → interval: "year", totalWeeks: 11
    - "10-year transformation" → interval: "year", totalWeeks: 10
    - "3-year roadmap" → interval: "quarter", totalWeeks: 12
    - "18-month development" → interval: "month", totalWeeks: 18
    - "Q1 to Q4 rollout in 2025" → interval: "quarter", totalWeeks: 4
    - "8-week sprint" → interval: "week", totalWeeks: 8

5. IMPORTANT: The "totalWeeks" field name is misleading - it actually holds the TOTAL NUMBER OF INTERVALS (weeks, months, quarters, or years)
6. IMPORTANT: startWeek and endWeek represent the interval sequence numbers (1..totalWeeks)
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
    private detectIntervalFromInputs(userInstructions: string, documents: string[]): string {
        const lowerInstructions = userInstructions.toLowerCase();
        const docsText = (documents || []).join('\n\n').toLowerCase();
        const combined = `${lowerInstructions}\n${docsText}`;
        
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
            if (pattern.test(combined)) {
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
            if (pattern.test(combined)) {
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
            if (pattern.test(combined)) {
                return '⚠️ DETECTED: This appears to be a WEEKLY project. You MUST set interval="week"';
            }
        }
        
        return '';
    }

    /**
     * Corrects the interval if AI didn't detect it properly
     * This is a fallback to ensure user's explicit time indicators are respected
     */
    private correctIntervalIfNeeded(data: GanttChartData, userInstructions: string, documents: string[]): GanttChartData {
        const lowerInstructions = userInstructions.toLowerCase();
        const docsText = (documents || []).join('\n\n').toLowerCase();
        const combined = `${lowerInstructions}\n${docsText}`;
        
        // Check for year range patterns (e.g., "2020 to 2030", "2020-2030")
    const yearRangeMatch = combined.match(/\b(20\d{2})\s*(?:to|-)\s*(20\d{2})/i);
        if (yearRangeMatch) {
            const startYear = parseInt(yearRangeMatch[1]);
            const endYear = parseInt(yearRangeMatch[2]);
            const totalYears = endYear - startYear + 1;
            
            if (data.interval !== 'year') {
                console.warn(`AI used interval="${data.interval}" but user specified year range. Correcting to "year"`);
                data.interval = 'year';
                
                // Adjust totalWeeks if it doesn't match the year range
                if (data.totalWeeks !== totalYears) {
                    console.warn(`Adjusting totalWeeks from ${data.totalWeeks} to ${totalYears} to match year range ${startYear}-${endYear}`);
                    
                    // Scale tasks proportionally
                    const scale = totalYears / data.totalWeeks;
                    data.phases.forEach(phase => {
                        phase.tasks.forEach(task => {
                            task.startWeek = Math.max(1, Math.round(task.startWeek * scale));
                            task.endWeek = Math.min(totalYears, Math.round(task.endWeek * scale));
                        });
                    });
                    
                    data.totalWeeks = totalYears;
                }
            }
            return data;
        }
        
        // Check for explicit year mentions (e.g., "10 years", "5-year")
    const yearsMatch = combined.match(/(\d+)\s*-?\s*years?/i);
        if (yearsMatch && data.interval !== 'year') {
            const years = parseInt(yearsMatch[1]);
            if (years >= 5) { // Use year granularity for 5+ years
                console.warn(`AI used interval="${data.interval}" but user specified ${years} years. Correcting to "year"`);
                data.interval = 'year';
                
                if (data.totalWeeks !== years) {
                    const scale = years / data.totalWeeks;
                    data.phases.forEach(phase => {
                        phase.tasks.forEach(task => {
                            task.startWeek = Math.max(1, Math.round(task.startWeek * scale));
                            task.endWeek = Math.min(years, Math.round(task.endWeek * scale));
                        });
                    });
                    data.totalWeeks = years;
                }
            }
            return data;
        }
        
        // Check for month mentions
    const monthsMatch = combined.match(/(\d+)\s*-?\s*months?/i);
        if (monthsMatch && data.interval !== 'month') {
            const months = parseInt(monthsMatch[1]);
            if (months >= 6) { // Only for 6+ months
                console.warn(`AI used interval="${data.interval}" but user specified ${months} months. Correcting to "month"`);
                data.interval = 'month';
                
                if (data.totalWeeks !== months) {
                    const scale = months / data.totalWeeks;
                    data.phases.forEach(phase => {
                        phase.tasks.forEach(task => {
                            task.startWeek = Math.max(1, Math.round(task.startWeek * scale));
                            task.endWeek = Math.min(months, Math.round(task.endWeek * scale));
                        });
                    });
                    data.totalWeeks = months;
                }
            }
            return data;
        }
        
        // Quarter detection (phrases like Q1, Q2 or 'quarterly', 'quarter plan')
        const quarterIndicators = /\b(q[1-4]|quarterly|quarter\s+plan|quarter\s+roadmap)\b/i;
        if (quarterIndicators.test(combined)) {
            // If multi-year 2-5 and not already year
            const rangeMatch = combined.match(/\b(20\d{2})\s*(?:to|-)\s*(20\d{2})/i);
            if (rangeMatch) {
                const s = parseInt(rangeMatch[1]);
                const e = parseInt(rangeMatch[2]);
                const yearsSpan = e - s + 1;
                if (yearsSpan >= 2 && yearsSpan <= 5) {
                    data.interval = 'quarter';
                    const quarters = yearsSpan * 4;
                    if (data.totalWeeks !== quarters) {
                        const scale = quarters / data.totalWeeks;
                        data.phases.forEach(phase => {
                            phase.tasks.forEach(task => {
                                task.startWeek = Math.max(1, Math.round(task.startWeek * scale));
                                task.endWeek = Math.min(quarters, Math.round(task.endWeek * scale));
                            });
                        });
                        data.totalWeeks = quarters;
                    }
                }
            } else {
                // If explicit years 2-5 without range string (e.g., '3-year plan' + quarterly indicators)
                const yearsMention = combined.match(/(\d+)\s*-?\s*years?/i);
                if (yearsMention) {
                    const yrs = parseInt(yearsMention[1]);
                    if (yrs >= 2 && yrs <= 5) {
                        data.interval = 'quarter';
                        const quarters = yrs * 4;
                        if (data.totalWeeks !== quarters) {
                            const scale = quarters / data.totalWeeks;
                            data.phases.forEach(phase => {
                                phase.tasks.forEach(task => {
                                    task.startWeek = Math.max(1, Math.round(task.startWeek * scale));
                                    task.endWeek = Math.min(quarters, Math.round(task.endWeek * scale));
                                });
                            });
                            data.totalWeeks = quarters;
                        }
                    }
                }
            }
        }

        return data;
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
            const correctedData = this.correctIntervalIfNeeded(data, userInstructions, documentContents);
            console.log('After correction:', JSON.stringify(correctedData, null, 2));
            
            return correctedData;

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
