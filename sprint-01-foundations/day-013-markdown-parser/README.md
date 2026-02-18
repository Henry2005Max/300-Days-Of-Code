# Day 13: Markdown Parser (marked library)

## Description
A markdown to HTML parser using the popular `marked` library! Parse .md files or direct text input, create sample markdown files, view statistics, and generate beautiful HTML with styled CSS.

##  Features
-  **Parse Files** - Convert .md files to HTML
-  **Direct Input** - Type markdown and get HTML instantly
-  **Sample Generator** - Create example markdown files
-  **Statistics** - Count lines, words, headings, links, code blocks
-  **Styled HTML** - Beautiful CSS included automatically
-  **Auto Save** - Generates ready-to-view HTML files

##  Technologies Used
- TypeScript
- Node.js
- marked (markdown parsing library)
- Chalk (terminal colors)
- fs/promises (file operations)

##  Installation

```bash
npm install
```

##  How to Run

```bash
npx ts-node markdown-parser.ts
```

##  Example Usage

### Parse a Markdown File:
```
1. Parse markdown file to HTML
Enter markdown file path: README.md

Success! HTML saved to: README.html

 MARKDOWN STATISTICS
  Lines:        45
  Words:        230
  Headings:     6
  Code Blocks:  2
  Links:        5
```

### Create Sample:
```
3. Create sample markdown file
Enter filename: sample.md

 Sample markdown created: sample.md
You can now use option 1 to parse it!
```

##  What I Learned
- Using external npm libraries (marked)
- Markdown syntax and parsing
- Generating complete HTML documents
- CSS styling in generated HTML
- File I/O with async/await
- Regex for counting markdown elements
- Multi-line input handling

##  Challenge Info
**Day:** 13/300  
**Sprint:** 1 - Foundations  
**Date:** Wed Feb 18
**Previous Day:** [Day 12 - Dice Roller](../day-012-dice-roller)  
**Next Day:** [Day 14 - Email Validator](../day-014-email-validator)  

---

Part of my 300 Days of Code Challenge! 
