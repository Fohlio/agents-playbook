# 🚀 How to Launch the Agents Playbook Extension in Cursor

## Quick Start (3 Steps)

### Step 1: Open the Extension in Cursor
```bash
cd /Users/ivanbunin/projects/agents-playbook/cursor-extension
cursor .
```
Or simply open Cursor and navigate to: File → Open → Select the `cursor-extension` folder

### Step 2: Launch the Extension
Once Cursor is open with the extension folder:

**Option A - Keyboard Shortcut:**
- Press `F5` (or `fn+F5` on Mac)

**Option B - Menu:**
- Go to: Run → Start Debugging

**Option C - Command Palette:**
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type: "Debug: Start Debugging"
- Press Enter

### Step 3: Use the Extension
A new Cursor window will open with your extension loaded. In this new window:

1. **Open Command Palette:** `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)

2. **Available Commands:**
   - `Agents Playbook: Start Workflow` - Begin a new workflow with orchestrator
   - `Agents Playbook: View Workflow Progress` - See current workflow status
   - `Agents Playbook: Validate Current Stage` - Review and approve stage output
   - `Agents Playbook: View Agent Status` - Monitor active agents
   - `Agents Playbook: Assign Agent to Stage` - Manually assign sub-agent
   - `Agents Playbook: Show Workflow Overview` - Display workflow summary

3. **Check Sidebar:**
   - Look for "Workflow Progress" view in the Explorer sidebar
   - Look for "Agent Status" view to monitor agents

## Testing the Extension

### Quick Test Workflow:

1. **Start a Workflow:**
   - Command Palette → "Agents Playbook: Start Workflow"
   - Select a workflow (e.g., "feature-development")

2. **Monitor Progress:**
   - Check the "Workflow Progress" sidebar
   - Watch as orchestrator assigns agents to stages

3. **Validate Stages:**
   - When prompted, use "Validate Current Stage" command
   - Review outputs in the validation UI
   - Approve or reject to continue

4. **Check TASKS.md:**
   - Look for generated `TASKS_[workflow].md` file in your workspace
   - See real-time agent assignments and progress

## Troubleshooting

### If Extension Doesn't Load:
1. Make sure you're in the extension directory
2. Run `npm install` to ensure dependencies are installed
3. Run `npm run compile` to compile TypeScript
4. Check the Debug Console for errors (View → Debug Console)

### If Commands Don't Appear:
1. Make sure you're in the Extension Development Host window (not the original)
2. Reload the window: `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux)
3. Check Output panel: View → Output → Select "Agents Playbook Orchestrator"

### For Workflow Testing:
Make sure you have workflow files in:
`/Users/ivanbunin/projects/agents-playbook/public/playbook/workflows/`

The extension will look for:
- feature-development.yml
- quick-fix.yml
- code-refactoring.yml

## Development Tips

- **View Logs:** Check the Output panel for extension logs
- **Debug:** Set breakpoints in the TypeScript files before pressing F5
- **Hot Reload:** Make changes and reload the Extension Host window with Cmd+R
- **Console:** Use Debug Console to interact with the extension runtime

## Visual Guide

When successfully loaded, you should see:

1. **In Activity Bar (left side):**
   - Explorer with "Workflow Progress" and "Agent Status" sections

2. **In Command Palette:**
   - 6 "Agents Playbook" commands available

3. **In Status Bar (bottom):**
   - Workflow status indicator when active

4. **In Workspace:**
   - TASKS_[workflow].md files being created and updated

Ready to orchestrate multi-agent workflows! 🎉