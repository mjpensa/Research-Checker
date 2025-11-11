# Setup Instructions for Gantt Chart Generator Extension

## Prerequisites Installation

### 1. Install Node.js and npm
1. Download Node.js from: https://nodejs.org/
2. Choose the LTS (Long Term Support) version
3. Run the installer and follow the prompts
4. Verify installation by opening a new PowerShell window and running:
   ```powershell
   node --version
   npm --version
   ```

### 2. Install Dependencies
Once Node.js is installed, open a terminal in this folder and run:
```powershell
npm install
```

This will install:
- TypeScript compiler
- VS Code extension types
- ESLint and other development tools

### 3. Compile the Extension
```powershell
npm run compile
```

This compiles the TypeScript source files to JavaScript in the `out/` folder.

## Running the Extension

### Method 1: Debug Mode (F5)
1. Open this folder in VS Code
2. Press `F5` (or select `Run > Start Debugging`)
3. A new VS Code window will open with the extension loaded
4. In the new window, press `Ctrl+Shift+P` and run: `Generate Gantt Chart from Documents`

### Method 2: Package and Install
1. Install vsce (Visual Studio Code Extension manager):
   ```powershell
   npm install -g @vscode/vsce
   ```

2. Package the extension:
   ```powershell
   vsce package
   ```

3. Install the generated .vsix file:
   - In VS Code, go to Extensions view (`Ctrl+Shift+X`)
   - Click the "..." menu at the top
   - Select "Install from VSIX..."
   - Choose the generated .vsix file

## Quick Test

After running the extension:

1. Press `Ctrl+Shift+P`
2. Type: `Generate Gantt Chart from Documents`
3. Select "Quick Instructions"
4. Enter: `Create an 8-week software project with planning, design, development, and testing phases`
5. Choose "No" for documents (or select your research documents)
6. Wait for AI generation
7. View the generated Gantt chart!

## Project Structure

```
gantt-chart-extension/
├── src/                      # TypeScript source files
│   ├── extension.ts          # Main extension entry point
│   ├── aiPromptService.ts    # AI/Copilot integration
│   ├── ganttGenerator.ts     # HTML template generation
│   ├── ganttPanel.ts         # Webview panel management
│   ├── documentManager.ts    # File reading and user input
│   └── types.ts              # TypeScript type definitions
├── out/                      # Compiled JavaScript (generated)
├── node_modules/             # Dependencies (generated)
├── gantt-chart.html          # Original template reference
├── package.json              # Extension manifest & dependencies
├── tsconfig.json             # TypeScript compiler configuration
├── README.md                 # Extension documentation
└── SETUP.md                  # This file
```

## Development Workflow

### Watch Mode
For active development, run the TypeScript compiler in watch mode:
```powershell
npm run watch
```

This automatically recompiles when you save changes to .ts files.

### Testing Changes
1. Make changes to source files in `src/`
2. If not in watch mode, run `npm run compile`
3. Press `Ctrl+Shift+F5` in the debug window to reload the extension
4. Test your changes

## How It Works

### 1. User Interaction Flow
```
User runs command
    ↓
Provides instructions (quick or detailed)
    ↓
Optionally selects research documents
    ↓
Extension reads document contents
    ↓
AI generates Gantt chart structure
    ↓
HTML is generated from structure
    ↓
Chart displayed in webview
    ↓
User can save as HTML file
```

### 2. AI Integration
The extension uses the **GitHub Copilot Language Model API** (`vscode.lm`):
- Sends structured prompts with your instructions and documents
- Requests JSON output matching the Gantt chart schema
- Validates and parses the AI response
- Falls back with helpful error messages if generation fails

### 3. Template Preservation
The `GanttChartGenerator` class:
- Maintains exact CSS from your original template
- Dynamically generates grid columns based on week count
- Preserves color schemes and styling
- Creates responsive layouts

## Customization

### Adding New Phase Colors
Edit `src/ganttGenerator.ts`, add to `colorScheme`:
```typescript
private readonly colorScheme = {
    // ... existing colors ...
    myNewPhase: { color: '#YOUR_COLOR', headerColor: '#HEADER_COLOR' }
};
```

### Modifying AI Behavior
Edit `src/aiPromptService.ts`, update the `generatePrompt()` method to change:
- Instructions given to the AI
- Output format requirements
- Validation rules

### Changing UI Flow
Edit `src/extension.ts`, modify the `generateGanttChart()` function to:
- Add new user input steps
- Change the order of operations
- Add additional processing

## Troubleshooting

### Extension Won't Load
- Check that you compiled with `npm run compile`
- Look for errors in the Debug Console
- Verify all dependencies are installed

### AI Generation Fails
- Ensure GitHub Copilot is active (check status bar)
- Verify your Copilot subscription is valid
- Try simpler instructions first
- Check the error message for specific issues

### Chart Doesn't Display
- Check browser console in the webview (open Developer Tools)
- Verify the HTML is being generated correctly
- Look for JavaScript errors

### Compilation Errors
```powershell
# Clean and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force out
npm install
npm run compile
```

## Next Steps

Once everything is working:

1. **Test with Real Documents**: Try with your actual research documents
2. **Refine Instructions**: Experiment with different instruction formats
3. **Export Charts**: Generate and save multiple chart variations
4. **Customize Colors**: Adjust the color scheme to match your brand
5. **Share**: Package and share the extension with your team

## Support

For issues or questions:
1. Check this SETUP.md file
2. Review README.md for usage details
3. Check TypeScript errors in VS Code Problems panel
4. Look at Debug Console output when running in debug mode

## Future Enhancements

Potential improvements:
- [ ] PDF text extraction support
- [ ] Word document parsing
- [ ] Interactive chart editing
- [ ] Multiple template styles
- [ ] Export to PNG/PDF
- [ ] Integration with project management tools
- [ ] Team collaboration features
