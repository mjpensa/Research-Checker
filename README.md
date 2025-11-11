# AI-Powered Gantt Chart Generator

A VS Code extension that uses AI to generate customized Gantt charts from research documents and user instructions while maintaining your exact template's look and feel.

## Features

- 🤖 **AI-Powered Generation**: Uses GitHub Copilot to analyze documents and create project timelines
- 📄 **Document Analysis**: Supports multiple document formats (TXT, MD, and more)
- 🎨 **Template Preservation**: Maintains exact color scheme, layout, and styling from your original template
- ⚙️ **Full Customization**: Adjusts phases, tasks, timelines, and labels based on your needs
- 💾 **Export to HTML**: Save generated charts as standalone HTML files

## Prerequisites

- Visual Studio Code v1.85.0 or higher
- GitHub Copilot subscription (for AI-powered generation)

## Installation

1. Open this folder in VS Code
2. Open the terminal and run:
   ```powershell
   npm install
   ```
3. Press `F5` to launch the extension in debug mode

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run the command: `Generate Gantt Chart from Documents`
3. Follow the prompts:
   - Choose between Quick or Detailed instructions
   - Provide your project instructions
   - Optionally select research documents to analyze
   - Wait for AI to generate the chart
4. View the generated Gantt chart in the preview panel
5. Optionally save as an HTML file

### Example Instructions

**Quick Instructions:**
```
Create a 10-week mobile app development project with planning, design, development, testing, and launch phases
```

**Detailed Instructions:**
```
Create a comprehensive project plan for developing an e-commerce platform:
- 12 weeks total timeline
- Planning phase: market research, requirements gathering (weeks 1-2)
- Design phase: wireframes, UI/UX design, database schema (weeks 3-5)
- Development phase: frontend, backend, payment integration, user auth (weeks 6-9)
- Testing phase: QA, bug fixes, performance testing (weeks 10-11)
- Launch phase: deployment, monitoring, documentation (week 12)
```

## Features in Detail

### Supported Phase Types
The extension recognizes and styles these phase types:
- `planning` (Blue)
- `design` (Orange)
- `development` (Red)
- `launch` (Green)
- `testing` (Purple)
- `research` (Gray)
- `deployment` (Green)
- `review` (Light Blue)

### Document Support
Currently supports:
- Plain text files (.txt)
- Markdown files (.md)
- Other formats (with basic text extraction)

Future support planned for:
- PDF files
- Word documents (.doc, .docx)

## Development

### Project Structure
```
gantt-chart-extension/
├── src/
│   ├── extension.ts           # Main extension entry point
│   ├── aiPromptService.ts     # AI prompt engineering
│   ├── ganttGenerator.ts      # HTML template generator
│   ├── ganttPanel.ts          # Webview panel manager
│   ├── documentManager.ts     # Document reading/selection
│   └── types.ts               # TypeScript interfaces
├── gantt-chart.html           # Original template reference
├── package.json               # Extension manifest
└── tsconfig.json              # TypeScript configuration
```

### Building
```powershell
npm run compile
```

### Watch Mode
```powershell
npm run watch
```

## How It Works

1. **User Input**: Collects project requirements and optional research documents
2. **AI Analysis**: Sends structured prompt to GitHub Copilot with:
   - User instructions
   - Document contents
   - Template style requirements
   - JSON output schema
3. **Validation**: Parses and validates AI response
4. **HTML Generation**: Creates HTML using template engine with exact styling
5. **Display**: Shows chart in VS Code webview panel
6. **Export**: Saves as standalone HTML file

## Customization

The template maintains these exact characteristics:
- Clean grid layout with bordered cells
- Color-coded phases with matching headers
- Week-based timeline columns
- Professional business aesthetic
- Rounded bar corners
- Shadow and spacing consistent with original

## Troubleshooting

**AI Generation Fails:**
- Ensure GitHub Copilot is enabled and active
- Check your Copilot subscription status
- Try simplifying your instructions

**Document Reading Errors:**
- Ensure files are readable and not corrupted
- For PDF/Word files, convert to .txt or .md format
- Check file permissions

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

## Credits

Based on the Gantt chart template design provided by the user.
