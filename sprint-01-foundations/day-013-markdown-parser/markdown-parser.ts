#!/usr/bin/env node

// Markdown Parser using marked library
// Day 13 of 300 Days of Code Challenge

import { marked } from 'marked';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

// ─── Parse Markdown to HTML ──────────────────────────────

async function parseMarkdown(markdown: string): Promise<string> {
  return await marked.parse(markdown);
}

// ─── Read Markdown File ──────────────────────────────────

async function readMarkdownFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Cannot read file: ${filePath}`);
  }
}

// ─── Write HTML File ─────────────────────────────────────

async function writeHTMLFile(filePath: string, html: string): Promise<void> {
  const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Parser Output</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    h3 { color: #7f8c8d; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: transparent;
      color: #ecf0f1;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #3498db;
      margin: 20px 0;
      padding-left: 20px;
      color: #7f8c8d;
    }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th { background: #3498db; color: white; }
    tr:nth-child(even) { background: #f9f9f9; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${html}
</body>
</html>
`;

  await fs.writeFile(filePath, fullHTML);
}

// ─── Create Sample Markdown ──────────────────────────────

function getSampleMarkdown(): string {
  return `# Welcome to Markdown Parser

This is a **sample markdown** document to demonstrate the parser!

## Features

The markdown parser supports:

- **Bold text** and *italic text*
- Lists (ordered and unordered)
- [Links](https://github.com)
- \`inline code\`
- Code blocks
- Tables
- Blockquotes
- And more!

## Code Example

Here's some JavaScript:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Table Example

| Feature | Supported |
|---------|-----------|
| Headings | ✅ |
| Lists | ✅ |
| Links | ✅ |
| Code | ✅ |
| Tables | ✅ |

## Blockquote

> "The only way to do great work is to love what you do."
> — Steve Jobs

## List Example

### Unordered List:
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered List:
1. First item
2. Second item
3. Third item

---

**That's it!** Try parsing your own markdown files now! 🚀
`;
}

// ─── Display Markdown Stats ──────────────────────────────

function displayStats(markdown: string): void {
  const lines = markdown.split('\n');
  const words = markdown.split(/\s+/).length;
  const chars = markdown.length;
  const headings = (markdown.match(/^#{1,6}\s/gm) || []).length;
  const codeBlocks = (markdown.match(/```/g) || []).length / 2;
  const links = (markdown.match(/\[.*?\]\(.*?\)/g) || []).length;
  const images = (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length;

  console.log(chalk.bold.cyan('\n  📊 MARKDOWN STATISTICS\n'));
  console.log(chalk.white(`  Lines:        ${lines.length}`));
  console.log(chalk.white(`  Words:        ${words}`));
  console.log(chalk.white(`  Characters:   ${chars}`));
  console.log(chalk.white(`  Headings:     ${headings}`));
  console.log(chalk.white(`  Code Blocks:  ${codeBlocks}`));
  console.log(chalk.white(`  Links:        ${links}`));
  console.log(chalk.white(`  Images:       ${images}`));
  console.log('');
}

// ─── Main Application ─────────────────────────────────────

async function runMarkdownParser() {
  console.clear();
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.bold.magenta('          📝 MARKDOWN PARSER 📝'));
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.white('\n   Parse Markdown to beautiful HTML!\n'));
  console.log(chalk.bold.magenta('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n📋 MENU\n'));
    console.log(chalk.white('   1. Parse markdown file to HTML'));
    console.log(chalk.white('   2. Parse markdown text directly'));
    console.log(chalk.white('   3. Create sample markdown file'));
    console.log(chalk.white('   4. View markdown statistics'));
    console.log(chalk.white('   5. Exit\n'));

    const choice = await askQuestion(chalk.cyan('Choose an option (1-5): '));

    if (choice === '5') {
      console.log(chalk.magenta('\n👋 Happy writing! Goodbye!\n'));
      break;
    }

    try {
      switch (choice) {
        case '1': {
          const inputPath = await askQuestion(chalk.cyan('\n  Enter markdown file path (e.g., sample.md): '));

          if (!inputPath) {
            console.log(chalk.red('\n  ❌ Please provide a file path!\n'));
            break;
          }

          console.log(chalk.cyan('\n  📖 Reading markdown file...'));
          const markdown = await readMarkdownFile(inputPath);

          console.log(chalk.cyan('  🔄 Parsing markdown to HTML...'));
          const html = await parseMarkdown(markdown);

          const baseName = path.basename(inputPath, path.extname(inputPath));
          const outputPath = `${baseName}.html`;

          console.log(chalk.cyan(`  💾 Saving HTML to ${outputPath}...`));
          await writeHTMLFile(outputPath, html);

          console.log(chalk.green(`\n  ✅ Success! HTML saved to: ${outputPath}\n`));
          displayStats(markdown);
          break;
        }

        case '2': {
          console.log(chalk.cyan('\n  Enter your markdown text (type "END" on a new line when done):\n'));

          const lines: string[] = [];
          let line = await askQuestion('');

          while (line !== 'END') {
            lines.push(line);
            line = await askQuestion('');
          }

          const markdown = lines.join('\n');

          if (!markdown.trim()) {
            console.log(chalk.red('\n  ❌ No markdown text provided!\n'));
            break;
          }

          console.log(chalk.cyan('\n  🔄 Parsing markdown to HTML...'));
          const html = await parseMarkdown(markdown);

          const outputPath = 'output.html';
          await writeHTMLFile(outputPath, html);

          console.log(chalk.green(`\n  ✅ Success! HTML saved to: ${outputPath}\n`));
          displayStats(markdown);
          break;
        }

        case '3': {
          const fileName = await askQuestion(chalk.cyan('\n  Enter filename (e.g., sample.md): ')) || 'sample.md';

          const sampleMd = getSampleMarkdown();
          await fs.writeFile(fileName, sampleMd);

          console.log(chalk.green(`\n  ✅ Sample markdown created: ${fileName}`));
          console.log(chalk.gray(`  You can now use option 1 to parse it!\n`));
          break;
        }

        case '4': {
          const filePath = await askQuestion(chalk.cyan('\n  Enter markdown file path: '));

          if (!filePath) {
            console.log(chalk.red('\n  ❌ Please provide a file path!\n'));
            break;
          }

          const markdown = await readMarkdownFile(filePath);
          displayStats(markdown);
          break;
        }

        default:
          console.log(chalk.red('\n  ❌ Invalid option! Please choose 1-5.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  ❌ Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('Continue? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.magenta('\n👋 Happy writing! Goodbye!\n'));
      continueRunning = false;
    }
  }

  rl.close();
} 