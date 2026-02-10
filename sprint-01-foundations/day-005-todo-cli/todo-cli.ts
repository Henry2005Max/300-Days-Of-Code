#!/usr/bin/env node

// Todo List CLI with Commander
// Day 5 of 300 Days of Code Challenge

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';


// Interface for Todo item
interface Todo {
  id: number;
  task: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

// Path to todos file
const TODOS_FILE = path.join(process.cwd(), 'todos.json');

// Load todos from file
async function loadTodos(): Promise<Todo[]> {
  try {
    const data = await fs.readFile(TODOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Save todos to file
async function saveTodos(todos: Todo[]): Promise<void> {
  await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
}

// Get next available ID
function getNextId(todos: Todo[]): number {
  if (todos.length === 0) return 1;
  return Math.max(...todos.map(t => t.id)) + 1;
}

// Add a new todo
async function addTodo(task: string, priority: string = 'medium'): Promise<void> {
  const todos = await loadTodos();
  
  const newTodo: Todo = {
    id: getNextId(todos),
    task,
    completed: false,
    createdAt: new Date().toISOString(),
    priority: priority as 'low' | 'medium' | 'high'
  };
  
  todos.push(newTodo);
  await saveTodos(todos);
  
  console.log(chalk.green('✅ Todo added successfully!'));
  console.log(chalk.gray(`   ID: ${newTodo.id}`));
  console.log(chalk.white(`   Task: ${newTodo.task}`));
  console.log(chalk.yellow(`   Priority: ${newTodo.priority}`));
}

// List all todos
async function listTodos(filter?: string): Promise<void> {
  const todos = await loadTodos();
  
  if (todos.length === 0) {
    console.log(chalk.yellow('📝 No todos yet! Add one with: todo add "Your task"'));
    return;
  }
  
  // Filter todos
  let filteredTodos = todos;
  if (filter === 'completed') {
    filteredTodos = todos.filter(t => t.completed);
  } else if (filter === 'pending') {
    filteredTodos = todos.filter(t => !t.completed);
  }
  
  if (filteredTodos.length === 0) {
    console.log(chalk.yellow(`📝 No ${filter} todos found!`));
    return;
  }
  
  console.log(chalk.bold('\n📋 YOUR TODO LIST\n'));
  
  filteredTodos.forEach(todo => {
    const status = todo.completed ? chalk.green('✓') : chalk.red('○');
    const taskText = todo.completed 
      ? chalk.gray.strikethrough(todo.task)
      : chalk.white(todo.task);
    
    let priorityColor = chalk.yellow;
    if (todo.priority === 'high') priorityColor = chalk.red;
    if (todo.priority === 'low') priorityColor = chalk.blue;
    
    const priority = priorityColor(`[${todo.priority.toUpperCase()}]`);
    
    console.log(`${status} ${chalk.cyan(`#${todo.id}`)} ${priority} ${taskText}`);
  });
  
  // Summary
  const completed = todos.filter(t => t.completed).length;
  const pending = todos.filter(t => !t.completed).length;
  
  console.log(chalk.gray('\n─────────────────────────────────────'));
  console.log(chalk.green(`✓ Completed: ${completed}`) + chalk.gray(' | ') + chalk.red(`○ Pending: ${pending}`));
  console.log(chalk.gray('─────────────────────────────────────\n'));
}

// Complete a todo
async function completeTodo(id: number): Promise<void> {
  const todos = await loadTodos();
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    console.log(chalk.red(`❌ Todo with ID ${id} not found!`));
    return;
  }
  
  if (todo.completed) {
    console.log(chalk.yellow(`⚠️  Todo #${id} is already completed!`));
    return;
  }
  
  todo.completed = true;
  await saveTodos(todos);
  
  console.log(chalk.green(`✅ Todo #${id} marked as completed!`));
  console.log(chalk.gray.strikethrough(`   ${todo.task}`));
}

// Delete a todo
async function deleteTodo(id: number): Promise<void> {
  const todos = await loadTodos();
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    console.log(chalk.red(`❌ Todo with ID ${id} not found!`));
    return;
  }
  
  const deletedTodo = todos.splice(index, 1)[0];
  await saveTodos(todos);
  
  console.log(chalk.green(`🗑️  Todo #${id} deleted!`));
  console.log(chalk.gray(`   ${deletedTodo.task}`));
}

// Update a todo
async function updateTodo(id: number, newTask: string): Promise<void> {
  const todos = await loadTodos();
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    console.log(chalk.red(`❌ Todo with ID ${id} not found!`));
    return;
  }
  
  const oldTask = todo.task;
  todo.task = newTask;
  await saveTodos(todos);
  
  console.log(chalk.green(`✏️  Todo #${id} updated!`));
  console.log(chalk.gray(`   Old: ${oldTask}`));
  console.log(chalk.white(`   New: ${newTask}`));
}

// Clear all todos
async function clearTodos(force: boolean = false): Promise<void> {
  if (!force) {
    console.log(chalk.yellow('⚠️  Use --force to clear all todos'));
    return;
  }
  
  await saveTodos([]);
  console.log(chalk.green('🗑️  All todos cleared!'));
}

// Show stats
async function showStats(): Promise<void> {
  const todos = await loadTodos();
  
  if (todos.length === 0) {
    console.log(chalk.yellow('📊 No todos yet!'));
    return;
  }
  
  const completed = todos.filter(t => t.completed).length;
  const pending = todos.filter(t => !t.completed).length;
  const high = todos.filter(t => t.priority === 'high').length;
  const medium = todos.filter(t => t.priority === 'medium').length;
  const low = todos.filter(t => t.priority === 'low').length;
  
  const completionRate = Math.round((completed / todos.length) * 100);
  
  console.log(chalk.bold('\n📊 TODO STATISTICS\n'));
  console.log(chalk.white(`Total Todos: ${todos.length}`));
  console.log(chalk.green(`✓ Completed: ${completed}`));
  console.log(chalk.red(`○ Pending: ${pending}`));
  console.log(chalk.cyan(`Completion Rate: ${completionRate}%`));
  
  console.log(chalk.bold('\n🎯 By Priority:\n'));
  console.log(chalk.red(`   High: ${high}`));
  console.log(chalk.yellow(`   Medium: ${medium}`));
  console.log(chalk.blue(`   Low: ${low}`));
  
  // Progress bar
  const barLength = 30;
  const completedBars = Math.round((completed / todos.length) * barLength);
  const pendingBars = barLength - completedBars;
  
  console.log(chalk.bold('\n📈 Progress:\n'));
  console.log(chalk.green('█'.repeat(completedBars)) + chalk.gray('░'.repeat(pendingBars)) + ` ${completionRate}%`);
  console.log('');
}

// Create commander program
const program = new Command();

program
  .name('todo')
  .description('📝 A simple and beautiful CLI todo list manager')
  .version('1.0.0');

// Add command
program
  .command('add <task>')
  .description('Add a new todo')
  .option('-p, --priority <level>', 'Set priority (low/medium/high)', 'medium')
  .action((task, options) => {
    addTodo(task, options.priority);
  });

// List command
program
  .command('list')
  .description('List all todos')
  .option('-f, --filter <type>', 'Filter todos (completed/pending)')
  .action((options) => {
    listTodos(options.filter);
  });

// Complete command
program
  .command('done <id>')
  .description('Mark a todo as completed')
  .action((id) => {
    completeTodo(parseInt(id));
  });

// Delete command
program
  .command('delete <id>')
  .description('Delete a todo')
  .alias('rm')
  .action((id) => {
    deleteTodo(parseInt(id));
  });

// Update command
program
  .command('update <id> <task>')
  .description('Update a todo')
  .action((id, task) => {
    updateTodo(parseInt(id), task);
  });

// Clear command
program
  .command('clear')
  .description('Clear all todos')
  .option('-f, --force', 'Force clear without confirmation')
  .action((options) => {
    clearTodos(options.force);
  }):

// Stats command
program
  .command('stats')
  .description('Show todo statistics')
  .action(() => {
    showStats();
  });

// Default action (list)
if (process.argv.length === 2) {
  listTodos();
} else {
  program.parse(process.argv);
}


