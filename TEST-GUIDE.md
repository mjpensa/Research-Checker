# Quick Test Guide - Intelligent Time Intervals

## Test the 10-Year Project Example

1. **Open the example document**:
   - File: `examples/10-year-strategic-project.md`

2. **Generate the Gantt chart**:
   - Use command: "Generate Gantt Chart"
   - Prompt: "Create a Gantt chart for this 10-year digital transformation project"

3. **Expected Result**:
   - Timeline should display in YEARS (Y1, Y2, Y3... Y10)
   - Phases spread across the 10-year period
   - Major phases like Infrastructure Modernization, Application Modernization, Digital Innovation

## Test Other Intervals

### Monthly Timeline (6-18 months)
```
Prompt: "Create a Gantt chart spanning 18 months for product development"
Expected: M1, M2, M3... M18
```

### Weekly Timeline (4-12 weeks)
```
Prompt: "Create an 8-week sprint plan for the fitness app"
Expected: W1, W2, W3... W8
```

## Key Verification Points

✅ **Correct Interval Selection**:
- 10 years → Years (Y)
- 18 months → Months (M)
- 8 weeks → Weeks (W)

✅ **Readable Layout**:
- Headers clearly show interval type
- Appropriate number of intervals (not too many/few)
- Phases and tasks align properly

✅ **AI Intelligence**:
- AI infers interval from prompt
- AI adjusts totalWeeks to match horizon
- Tasks distributed appropriately

## Troubleshooting

If the chart uses wrong intervals:
1. Be more explicit in your prompt
2. Mention the time horizon clearly
3. Use keywords like "year", "month", "week"

Example: 
- ❌ "Create a strategic roadmap"
- ✅ "Create a 5-year strategic roadmap"
