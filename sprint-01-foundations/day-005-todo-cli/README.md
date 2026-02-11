# Day 5: Todo List CLI with Commander

##  Description
A beautiful, feature-rich command-line todo list manager built with TypeScript, Commander.js, and Chalk. Manage your tasks efficiently with colors, priorities, and comprehensive statistics!

##  Features
-  **Add Todos** - Create tasks with priorities (low/medium/high)
-  **List Todos** - View all tasks with status indicators
-   **Complete Todos** - Mark tasks as done
-  **Delete Todos** - Remove tasks
-  **Update Todos** - Edit existing tasks
-  **Color-Coded** - Visual priority levels and status
-  **Statistics** - Completion rates and priority breakdown
-  **Filtering** - View completed or pending tasks
-  **Persistent Storage** - Saves to JSON file
-  **Professional CLI** - Built with Commander framework

##  Technologies Used
- TypeScript
- Node.js
- Commander.js (CLI framework)
- Chalk (terminal colors)
- fs/promises (file storage)

##  Installation

1. Make sure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

##  How to Run

### Quick Run (with ts-node):
```bash
ts-node todo-cli.ts <command>
```

### Build and Run:
```bash
npm run build
node todo-cli.js <command>
```

### Or use the npm scripts:
```bash
npm run dev -- <command>
```

##  Commands

### Add a Todo
```bash
ts-node todo-cli.ts add "Buy groceries"
ts-node todo-cli.ts add "Finish project" --priority high
ts-node todo-cli.ts add "Read book" -p low
```

### List Todos
```bash
ts-node todo-cli.ts list                    # All todos
ts-node todo-cli.ts list --filter pending   # Only pending
ts-node todo-cli.ts list -f completed       # Only completed
```

### Complete a Todo
```bash
ts-node todo-cli.ts done 1
```

### Delete a Todo
```bash
ts-node todo-cli.ts delete 2
ts-node todo-cli.ts rm 2        # Short alias
```

### Update a Todo
```bash
ts-node todo-cli.ts update 1 "Buy groceries and cook"
```

### Clear All Todos
```bash
ts-node todo-cli.ts clear --force
ts-node todo-cli.ts clear -f
```

### Show Statistics
```bash
ts-node todo-cli.ts stats
```

### Show Help
```bash
ts-node todo-cli.ts --help
ts-node todo-cli.ts add --help
```

##  Example Output

### Adding a Todo:
```
 Todo added successfully!
   ID: 1
   Task: Buy groceries
   Priority: medium
```

### Listing Todos:
```
 YOUR TODO LIST

✓ #1 [MEDIUM] Buy groceries
○ #2 [HIGH] Finish project
○ #3 [LOW] Read book

─────────────────────────────────────
✓ Completed: 1 | ○ Pending: 2
─────────────────────────────────────
```

### Statistics:
```
 TODO STATISTICS

Total Todos: 5
✓ Completed: 2
○ Pending: 3
Completion Rate: 40%

 By Priority:

   High: 1
   Medium: 3
   Low: 1

 Progress:

████████████░░░░░░░░░░░░░░░░░░ 40%
```

##  Priority Levels

- 🔴 **HIGH** - Urgent tasks (red)
- 🟡 **MEDIUM** - Normal tasks (yellow)
- 🔵 **LOW** - Low priority (blue)

##  What I Learned
- Using Commander.js for building CLI applications
- Command arguments and options/flags
- Terminal colors with Chalk
- File-based data persistence with JSON
- TypeScript interfaces for data structures
- Building a complete CRUD application
- CLI best practices and user experience
- Progress bars and visual feedback
- Command aliases and shortcuts

##  How It Works

### Data Storage:
```typescript
// Todos are stored in todos.json
[
  {
    "id": 1,
    "task": "Buy groceries",
    "completed": false,
    "createdAt": "2024-02-09T10:30:00.000Z",
    "priority": "medium"
  }
]
```

### Commander Setup:
```typescript
program
  .command('add <task>')
  .option('-p, --priority <level>', 'Set priority')
  .action((task, options) => {
    addTodo(task, options.priority);
  });
```

### Color Coding:
```typescript
// Completed tasks are green and strikethrough
const taskText = todo.completed 
  ? chalk.gray.strikethrough(todo.task)
  : chalk.white(todo.task);
```

##  Data Flow

```
User Command
    ↓
Commander parses arguments
    ↓
Load todos from JSON file
    ↓
Perform operation (add/delete/update)
    ↓
Save todos back to JSON
    ↓
Display result with colors
```

## Future Improvements
- Due dates and reminders
- Categories/tags for todos
- Search functionality
- Sort by priority or date
- Export to different formats
- Cloud sync
- Recurring tasks
- Subtasks/nested todos
- Time tracking
- Archive completed tasks

## ⚙️ Command Reference

| Command | Alias | Description | Example |
|---------|-------|-------------|---------|
| `add` | - | Add a new todo | `add "Task" -p high` |
| `list` | - | List all todos | `list --filter pending` |
| `done` | - | Complete a todo | `done 1` |
| `delete` | `rm` | Delete a todo | `delete 2` |
| `update` | - | Update a todo | `update 1 "New task"` |
| `clear` | - | Clear all todos | `clear --force` |
| `stats` | - | Show statistics | `stats` |

##  Color Legend

- 🟢 **Green** - Completed/Success
- 🔴 **Red** - Pending/High Priority
- 🟡 **Yellow** - Medium Priority/Warnings
- 🔵 **Blue** - Low Priority
- ⚪ **Gray** - Completed tasks (strikethrough)
- 🔵 **Cyan** - IDs and accents

##  File Location

Todos are saved in `todos.json` in the current directory.

##  Troubleshooting

**Problem:** "Cannot find module 'commander'"
- **Solution:** Run `npm install`

**Problem:** Colors not showing
- **Solution:** Use a terminal that supports colors (most modern terminals do)

**Problem:** "Todo with ID X not found"
- **Solution:** Use `list` command to see available IDs

**Problem:** Changes not persisting
- **Solution:** Make sure you have write permissions in the directory

## Challenge Info
**Day:** 5/300  
**Sprint:** 1 - Foundations  
**Date:** Tue Feb 10 
**Previous Day:** [Day 4 - Weather API](../day-004-weather-api)  
**Next Day:** [Day 6 - Quote Fetcher](../day-006-quote-fetcher)  

---

Part of my 300 Days of Code Challenge! 🚀
