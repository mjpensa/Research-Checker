# Intelligent Time Interval & Scaling Feature

## Overview
The Gantt Chart Generator now intelligently adjusts timeline intervals (weeks, months, quarters, or years) based on the project horizon and semantic cues present in both your prompt and research documents. This ensures charts remain readable and appropriately scaled regardless of project duration.

## How It Works

### Automatic Interval Selection
The AI analyzes your project requirements and research documents to select the most appropriate time unit:

- **Weeks**: Projects < ~6 months or prompts mentioning sprints/iterations
- **Months**: 6–8 month projects, or 9–23 month detailed timelines when month-level granularity is explicitly requested
- **Quarters**: 2–5 year roadmaps, quarterly plans, fiscal year breakdowns (e.g., Q1–Q4)
- **Years**: 5+ year strategic / transformation initiatives, decade-scale programs

### Inference Logic
The system infers the appropriate interval from:

1. **Explicit Duration Mentions**
   - "10 years" → years
   - "6 months" → months
   - "8 weeks" → weeks

2. **Contextual Keywords**
   - "long-term", "strategic" → likely months or years
   - "quarters", "fiscal year" → quarters (or years if 6+ year range)
   - "sprint", "iteration" → weeks

3. **Content Analysis**
   - Research phases and complexity
   - Task descriptions and dependencies
   - Industry standards and best practices

## Examples

### Short-term Project (Weeks)
```
"Create a Gantt chart for a web application launch spanning 8 weeks"
```
Result: Timeline displayed in weeks (W1, W2, W3...)

### Medium-term Project (Months)
```
"Generate a Gantt chart for a product development cycle over 18 months"
```
Result: Timeline displayed in months (M1, M2, M3...)

### Quarterly Roadmap (Quarters)
```
"Build a roadmap from 2025–2027 focusing on quarterly execution with Q1–Q4 milestones"
```
Result: Timeline displayed in quarters (Q1, Q2 ... Q12)

### Long-term Project (Years)
```
"Create a Gantt chart for a digital transformation spanning 10 years"
```
Result: Timeline displayed in years (Y1, Y2, Y3...)

## Usage Tips

1. **Be Explicit**: Mention the duration in your prompt for best results
   - ✅ "Create a 10-year strategic roadmap"
   - ✅ "Build a 6-month development plan"

2. **Provide Context**: Include project scope indicators
   - ✅ "Enterprise-wide transformation"
   - ✅ "Quick MVP launch"

3. **Use Standard Terms**: The AI recognizes industry terminology
   - "Fiscal year", "Quarter", "Sprint", "Phase"

## Testing the Feature

Try these example prompts with the included documents:

1. **10-Year Project**: Use `examples/10-year-strategic-project.md`
   - Prompt: "Create a Gantt chart for this 10-year transformation project"
   - Expected: Timeline in years (Y1-Y10)

2. **6-Month Project**: Use `examples/ecommerce-project.md`
   - Prompt: "Create a 6-month development timeline"
   - Expected: Timeline in months (M1-M6)

3. **8-Week Project**: Use `examples/fitness-app-project.md`
   - Prompt: "Create an 8-week sprint plan"
   - Expected: Timeline in weeks (W1-W8)

## Technical Details

### Data Structure
The `GanttChartData` interface now includes:
```typescript
{
  title: string;
  totalWeeks: number;  // Total number of intervals (despite the name)
   interval: "week" | "month" | "quarter" | "year";  // The time unit
  phases: GanttPhase[];
}
```

### Backward Compatibility
- Charts without the `interval` field default to "week"
- Existing charts continue to work without modification
- The `startWeek` and `endWeek` fields are used generically for all interval types (week/month/quarter/year)

## Benefits

1. **Improved Readability**: Charts are appropriately scaled for their duration
2. **Better Context**: Time units match the project scope
3. **Professional Output**: Industry-standard interval conventions
4. **Flexibility**: Handles any project duration from weeks to decades
5. **Intelligence**: No manual configuration required
6. **Quarter Support**: Clean scaling for mid-range multi-year projects
