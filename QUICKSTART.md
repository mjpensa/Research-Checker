# Quick Start Guide

Get your AI-powered Gantt chart generator running in 5 minutes!

## Step 1: Install Node.js (if not already installed)

1. Download from: https://nodejs.org/
2. Install the LTS version
3. Restart VS Code after installation

## Step 2: Install Dependencies

Open terminal in this folder and run:
```powershell
npm install
```

## Step 3: Run the Extension

Press `F5` in VS Code - this will:
- Compile the TypeScript code
- Open a new VS Code window with the extension loaded

## Step 4: Generate Your First Gantt Chart

In the new window:

1. Press `Ctrl+Shift+P` to open Command Palette
2. Type: `Generate Gantt Chart from Documents`
3. Select **"Quick Instructions"**
4. Paste this example:
   ```
   Create an 8-week web development project with planning, design, development, and testing phases
   ```
5. Choose **"No"** for documents (to test without files first)
6. Wait 10-20 seconds for AI to generate
7. View your Gantt chart! 🎉

## Step 5: Try with Documents

1. Run the command again: `Generate Gantt Chart from Documents`
2. Select **"Quick Instructions"**
3. Enter:
   ```
   Based on the project requirements, create a detailed timeline
   ```
4. Choose **"Yes"** for documents
5. Select: `examples/ecommerce-project.md`
6. Watch the AI analyze your document and create a custom chart!

## What's Next?

### Try Different Projects
Check out the `examples/` folder for:
- `ecommerce-project.md` - E-commerce platform
- `fitness-app-project.md` - Mobile app development
- `example-instructions.md` - More instruction templates

### Customize for Your Needs
Edit `src/ganttGenerator.ts` to:
- Add new color schemes
- Modify styling
- Change layout

### Share Your Charts
When you generate a chart:
1. Click "Save" when prompted
2. Choose where to save the HTML file
3. Share the standalone HTML file with anyone!

## Troubleshooting

**"npm is not recognized"**
- Install Node.js from https://nodejs.org/
- Restart VS Code
- Open a new terminal

**"No language models available"**
- Ensure GitHub Copilot is installed and activated
- Check your Copilot subscription status
- Sign in to GitHub Copilot

**Extension won't load**
- Make sure you ran `npm install`
- Press `Ctrl+Shift+F5` to reload the extension
- Check the Debug Console for errors

## Tips for Best Results

✅ **Be Specific**: Include number of weeks and phase names
✅ **Use Action Words**: "Develop features" vs "Features"
✅ **Logical Order**: Plan → Design → Build → Test → Launch
✅ **Realistic Timing**: Allow enough weeks for each phase
✅ **Include Documents**: More context = better results

## Example: Perfect Instructions

```
Create a 12-week mobile app development project:

Planning (Weeks 1-2):
- Requirements gathering
- Technical architecture design

Design (Weeks 3-4):
- UI/UX wireframes
- Visual design and branding

Development (Weeks 5-9):
- Frontend development
- Backend API creation
- Database setup
- Third-party integrations

Testing (Weeks 10-11):
- QA testing
- Bug fixes
- Performance optimization

Launch (Week 12):
- App store submission
- Production deployment
- Marketing campaign launch
```

## Need Help?

1. Read `SETUP.md` for detailed setup instructions
2. Check `README.md` for full documentation
3. Review `examples/example-instructions.md` for more samples
4. Look at the Debug Console for error messages

---

**Ready to create amazing Gantt charts? Press F5 and get started!** 🚀
