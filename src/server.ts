import express, { Request, Response } from 'express';
import { GanttChartGenerator } from './ganttGenerator';
import { GanttChartData } from './types';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const generator = new GanttChartGenerator();

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'gantt-chart-generator' });
});

// Main generation endpoint
app.post('/api/generate', async (req: Request, res: Response) => {
    try {
        const { instructions, documents, format = 'html' } = req.body;

        if (!instructions) {
            return res.status(400).json({ error: 'Instructions are required' });
        }

        // Call OpenAI API to generate chart data
        const ganttData = await generateWithOpenAI(instructions, documents || []);

        if (format === 'json') {
            return res.json(ganttData);
        }

        // Generate HTML
        const html = generator.generateHTML(ganttData);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate chart',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Simple web UI
app.get('/', (req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Gantt Chart Generator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 30px; }
        textarea {
            width: 100%;
            min-height: 150px;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            font-family: inherit;
            margin-bottom: 20px;
        }
        button {
            background: #2196f3;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            font-weight: 600;
        }
        button:hover { background: #1976d2; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .loading { display: none; margin-top: 20px; color: #666; }
        .error { color: #f44336; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 AI Gantt Chart Generator</h1>
        <p>Generate beautiful project timelines using AI</p>
        
        <label for="instructions"><strong>Project Instructions:</strong></label>
        <textarea id="instructions" placeholder="Example: Create a 10-week software development project with planning, design, development, testing, and launch phases"></textarea>
        
        <button onclick="generate()">Generate Chart</button>
        
        <div class="loading" id="loading">Generating your chart... ⏳</div>
        <div class="error" id="error"></div>
    </div>

    <script>
        async function generate() {
            const instructions = document.getElementById('instructions').value;
            const button = document.querySelector('button');
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            
            if (!instructions.trim()) {
                error.textContent = 'Please enter instructions';
                return;
            }
            
            button.disabled = true;
            loading.style.display = 'block';
            error.textContent = '';
            
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ instructions, format: 'html' })
                });
                
                if (!response.ok) throw new Error('Generation failed');
                
                const html = await response.text();
                
                // Open in new window
                const newWindow = window.open();
                newWindow.document.write(html);
                newWindow.document.close();
                
            } catch (err) {
                error.textContent = 'Error: ' + err.message;
            } finally {
                button.disabled = false;
                loading.style.display = 'none';
            }
        }
    </script>
</body>
</html>
    `);
});

async function generateWithOpenAI(instructions: string, documents: string[]): Promise<GanttChartData> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not set');
    }

    const prompt = buildPrompt(instructions, documents);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are an expert project manager. Generate Gantt chart data in JSON format.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return JSON.parse(content);
}

function buildPrompt(instructions: string, documents: string[]): string {
    const docsText = documents.length > 0 
        ? documents.map((doc, i) => `--- Document ${i + 1} ---\n${doc}`).join('\n\n')
        : '(No documents provided)';

    return `Generate a Gantt chart based on these instructions and documents.

USER INSTRUCTIONS:
${instructions}

DOCUMENTS:
${docsText}

OUTPUT FORMAT (JSON only):
{
  "title": "Project Title",
  "totalWeeks": 8,
  "phases": [
    {
      "name": "Phase Name",
      "colorClass": "planning",
      "color": "#2196f3",
      "tasks": [
        { "name": "Task Name", "startWeek": 1, "endWeek": 2 }
      ]
    }
  ]
}

RULES:
- colorClass must be one of: planning, design, development, testing, launch, research, deployment, review
- Weeks start from 1
- Create realistic timelines
- 2-5 tasks per phase typically
- Respond with ONLY valid JSON`;
}

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Generate charts at http://localhost:${port}`);
});
