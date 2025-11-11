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
        label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            margin-top: 20px;
        }
        textarea {
            width: 100%;
            min-height: 150px;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            font-family: inherit;
            margin-bottom: 10px;
        }
        .file-upload {
            border: 2px dashed #ddd;
            border-radius: 4px;
            padding: 30px;
            text-align: center;
            margin-bottom: 20px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .file-upload:hover {
            border-color: #2196f3;
            background: #f0f8ff;
        }
        .file-upload.dragover {
            border-color: #2196f3;
            background: #e3f2fd;
        }
        #fileInput {
            display: none;
        }
        .file-list {
            margin-top: 10px;
            font-size: 14px;
        }
        .file-item {
            background: #f5f5f5;
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .remove-file {
            color: #f44336;
            cursor: pointer;
            font-weight: bold;
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
            width: 100%;
        }
        button:hover { background: #1976d2; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .loading { display: none; margin-top: 20px; color: #666; text-align: center; }
        .error { color: #f44336; margin-top: 20px; }
        .hint { font-size: 12px; color: #999; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 AI Gantt Chart Generator</h1>
        <p>Generate beautiful project timelines using AI</p>
        
        <label for="instructions">📋 Project Instructions:</label>
        <textarea id="instructions" placeholder="Example: Create a 10-week software development project with planning, design, development, testing, and launch phases. Analyze the attached research documents to determine specific tasks and timelines."></textarea>
        <div class="hint">Describe your project and reference any documents you upload below</div>
        
        <label>📄 Research Documents (Optional):</label>
        <div class="file-upload" id="dropZone">
            <p>📎 Click to select files or drag and drop</p>
            <p style="font-size: 12px; color: #999; margin-top: 5px;">Supports: .txt, .md, .pdf, .docx</p>
        </div>
        <input type="file" id="fileInput" multiple accept=".txt,.md,.pdf,.doc,.docx">
        <div class="file-list" id="fileList"></div>
        
        <button onclick="generate()">Generate Chart</button>
        
        <div class="loading" id="loading">🤖 AI is analyzing your documents and generating your chart... ⏳</div>
        <div class="error" id="error"></div>
    </div>

    <script>
        let selectedFiles = [];
        
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        
        // Click to select files
        dropZone.addEventListener('click', () => fileInput.click());
        
        // Drag and drop handlers
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
        
        function handleFiles(files) {
            selectedFiles = Array.from(files);
            displayFiles();
        }
        
        function displayFiles() {
            fileList.innerHTML = '';
            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = \`
                    <span>📄 \${file.name} (\${formatFileSize(file.size)})</span>
                    <span class="remove-file" onclick="removeFile(\${index})">✕</span>
                \`;
                fileList.appendChild(fileItem);
            });
        }
        
        function removeFile(index) {
            selectedFiles.splice(index, 1);
            displayFiles();
        }
        
        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
        
        async function generate() {
            const instructions = document.getElementById('instructions').value;
            const button = document.querySelector('button');
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            
            if (!instructions.trim()) {
                error.textContent = '❌ Please enter project instructions';
                return;
            }
            
            button.disabled = true;
            loading.style.display = 'block';
            error.textContent = '';
            
            try {
                // Read file contents
                const documents = [];
                for (const file of selectedFiles) {
                    const text = await readFileAsText(file);
                    documents.push(text);
                }
                
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        instructions, 
                        documents,
                        format: 'html' 
                    })
                });
                
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Generation failed');
                }
                
                const html = await response.text();
                
                // Open in new window
                const newWindow = window.open();
                newWindow.document.write(html);
                newWindow.document.close();
                
            } catch (err) {
                error.textContent = '❌ Error: ' + err.message;
            } finally {
                button.disabled = false;
                loading.style.display = 'none';
            }
        }
        
        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(new Error('Failed to read file: ' + file.name));
                reader.readAsText(file);
            });
        }
    </script>
</body>
</html>
    `);
});

async function generateWithOpenAI(instructions: string, documents: string[]): Promise<GanttChartData> {
    // Try Google Gemini first, fall back to OpenAI
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (geminiKey) {
        return generateWithGemini(instructions, documents, geminiKey);
    } else if (openaiKey) {
        return generateWithOpenAIAPI(instructions, documents, openaiKey);
    } else {
        throw new Error('No API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in Railway environment variables.');
    }
}

async function generateWithGemini(instructions: string, documents: string[], apiKey: string): Promise<GanttChartData> {
    const prompt = buildPrompt(instructions, documents);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Google Gemini API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from markdown code blocks if present
    let jsonText = content.trim();
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        jsonText = jsonMatch[1];
    }
    
    return JSON.parse(jsonText);
}

async function generateWithOpenAIAPI(instructions: string, documents: string[], apiKey: string): Promise<GanttChartData> {
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
