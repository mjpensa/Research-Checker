# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     extension.ts                             │
│                  (Main Entry Point)                          │
│                                                              │
│  - Registers commands                                        │
│  - Orchestrates workflow                                     │
│  - Handles user interactions                                 │
└─────────────────────────────────────────────────────────────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Document     │  │ AI Prompt    │  │ Gantt        │  │ Gantt        │
│ Manager      │  │ Service      │  │ Generator    │  │ Panel        │
│              │  │              │  │              │  │              │
│ - File       │  │ - Prompt     │  │ - HTML       │  │ - Webview    │
│   selection  │  │   engineering│  │   generation │  │   display    │
│ - Reading    │  │ - AI API     │  │ - Template   │  │ - Updates    │
│   documents  │  │   calls      │  │   engine     │  │              │
│ - User input │  │ - Validation │  │ - Styling    │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
       │                  │                  │
       │                  ▼                  │
       │         ┌──────────────┐            │
       │         │ GitHub       │            │
       │         │ Copilot API  │            │
       │         │ (vscode.lm)  │            │
       │         └──────────────┘            │
       │                  │                  │
       │                  ▼                  │
       │         ┌──────────────┐            │
       └────────▶│ GanttChart   │◀───────────┘
                 │ Data (JSON)  │
                 └──────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ HTML Output  │
                 │ (Gantt Chart)│
                 └──────────────┘
```

## Data Flow

### 1. User Initiates Command
```
User → Command Palette → "Generate Gantt Chart from Documents"
```

### 2. Input Collection
```
extension.ts → DocumentManager.getUserInstructions()
            → DocumentManager.selectDocuments()
            → DocumentManager.readDocuments()
```

### 3. AI Processing
```
AIPromptService.generatePrompt()
    ↓
    Creates structured prompt with:
    - User instructions
    - Document contents
    - Template requirements
    - JSON schema
    ↓
GitHub Copilot API (vscode.lm.sendRequest)
    ↓
AI Response (JSON)
    ↓
AIPromptService.parseResponse()
    ↓
Validated GanttChartData
```

### 4. HTML Generation
```
GanttChartData → GanttGenerator.generateHTML()
    ↓
    - Injects data into template
    - Preserves original styling
    - Creates grid structure
    - Applies color schemes
    ↓
Complete HTML string
```

### 5. Display & Export
```
HTML → GanttPanel.createOrShow()
    ↓
Webview Display
    ↓
User option to save
    ↓
Saved HTML file
```

## Type Definitions

### GanttChartData
```typescript
{
  title: string
  totalWeeks: number
  phases: [
    {
      name: string
      colorClass: string
      color: string
      tasks: [
        {
          name: string
          startWeek: number
          endWeek: number
        }
      ]
    }
  ]
}
```

## Component Responsibilities

### extension.ts
- **Purpose**: Main orchestrator
- **Responsibilities**:
  - Command registration
  - Workflow coordination
  - Error handling
  - User feedback (progress, messages)

### documentManager.ts
- **Purpose**: Handle file I/O and user input
- **Responsibilities**:
  - Document selection dialog
  - File reading (txt, md, pdf, docx)
  - User instruction collection
  - Input validation

### aiPromptService.ts
- **Purpose**: AI integration and prompt engineering
- **Responsibilities**:
  - Construct prompts with context
  - Call GitHub Copilot API
  - Parse AI responses
  - Validate data structure

### ganttGenerator.ts
- **Purpose**: HTML template engine
- **Responsibilities**:
  - Generate HTML from data
  - Maintain styling consistency
  - Create responsive layouts
  - Apply color schemes

### ganttPanel.ts
- **Purpose**: Webview management
- **Responsibilities**:
  - Create/show webview panel
  - Update content
  - Handle lifecycle
  - Resource management

## Configuration Files

### package.json
- Extension manifest
- Commands definition
- Dependencies
- Scripts

### tsconfig.json
- TypeScript compiler options
- Output configuration
- Module resolution

### .vscode/launch.json
- Debug configuration
- Extension host settings

### .vscode/tasks.json
- Build tasks
- Watch mode configuration

## Extension Lifecycle

```
┌─────────────────┐
│  Extension      │
│  Installed      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  VS Code        │
│  Activates      │
│  Extension      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  activate()     │
│  function runs  │
│                 │
│  - Registers    │
│    commands     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extension      │
│  Active &       │
│  Ready          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User runs      │
│  command        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate       │
│  Gantt Chart    │
│  workflow       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display &      │
│  Save results   │
└─────────────────┘
```

## Color Scheme Mapping

The extension supports these predefined color schemes:

| Phase Name  | Color Code | Usage                        |
|-------------|-----------|------------------------------|
| planning    | #2196f3   | Blue - Initial planning      |
| design      | #ff9800   | Orange - Design work         |
| development | #ff5722   | Red - Core development       |
| launch      | #00bfa5   | Green - Launch activities    |
| testing     | #9c27b0   | Purple - QA and testing      |
| research    | #607d8b   | Gray - Research phase        |
| deployment  | #4caf50   | Green - Deployment           |
| review      | #03a9f4   | Light Blue - Review phase    |

## API Integration

### GitHub Copilot Language Model API

```typescript
// Select model
const models = await vscode.lm.selectChatModels({
  vendor: 'copilot',
  family: 'gpt-4o'
});

// Create messages
const messages = [
  vscode.LanguageModelChatMessage.User(prompt)
];

// Send request
const response = await model.sendRequest(
  messages, 
  {}, 
  cancellationToken
);

// Process streaming response
for await (const chunk of response.text) {
  fullResponse += chunk;
}
```

## Error Handling Strategy

1. **Input Validation**: Check user inputs before processing
2. **API Error Handling**: Catch and explain API failures
3. **Parse Error Handling**: Validate AI responses
4. **File I/O Errors**: Handle document reading issues
5. **User Feedback**: Show progress and clear error messages

## Performance Considerations

- **Document Reading**: Async operations for large files
- **AI Processing**: Shows progress indicator during generation
- **HTML Generation**: Efficient string building
- **Webview**: Reuses panel when possible

## Security Considerations

- **HTML Escaping**: All user inputs are escaped
- **File Access**: Only reads user-selected files
- **API Keys**: Uses VS Code's built-in Copilot auth
- **Sandbox**: Webview runs in sandboxed context
