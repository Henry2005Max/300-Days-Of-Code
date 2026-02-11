# Day 3: File Renamer using fs/promises

## Description
A powerful command-line file renaming utility built with TypeScript and Node.js fs/promises API. Rename single files, batch rename multiple files, remove spaces, change extensions, and more!

##  Features
-  **Single File Rename** - Rename individual files
-  **Batch Rename** - Rename multiple files with prefix, suffix, and sequential numbers
-  **Remove Spaces** - Replace spaces with underscores in filenames
-  **Change Extensions** - Convert file extensions (e.g., .txt to .md)
-  **Convert to Lowercase** - Make all filenames lowercase
-  **Directory Browsing** - Work with any directory on your system
-  **Safety Checks** - Prevents overwriting existing files
-  **Interactive Menu** - Easy-to-use command-line interface

##  Technologies Used
- TypeScript
- Node.js
- fs/promises (async file operations)
- path module
- readline (user input)

##  Safety Features
- Checks if target file already exists before renaming
- Confirmation prompts for batch operations
- Error handling for invalid paths
- Filters hidden files automatically

##  Installation

1. Make sure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

##  How to Run

### Quick Run (with ts-node):
```bash
ts-node file-renamer.ts
```

### Build and Run:
```bash
npm run build
npm start
```

### Development Mode:
```bash
npm run dev
```

## Example Usage

### Example 1: Batch Rename Photos
```
Choose an option: 2
Enter directory path: ./photos
Enter prefix: vacation_
Enter suffix: _2024
Starting number: 1

Results:
IMG001.jpg → vacation_001_2024.jpg
IMG002.jpg → vacation_002_2024.jpg
IMG003.jpg → vacation_003_2024.jpg
```

### Example 2: Remove Spaces
```
Choose an option: 3
Enter directory path: ./documents

Files before:
my document.txt
final report.docx
meeting notes.pdf

Files after:
my_document.txt
final_report.docx
meeting_notes.pdf
```

### Example 3: Change Extension
```
Choose an option: 4
Enter current extension: txt
Enter new extension: md

file1.txt → file1.md
notes.txt → notes.md
```

### Example 4: Convert to Lowercase
```
Choose an option: 5

MyFile.TXT → myfile.txt
REPORT.PDF → report.pdf
```

##  Menu Options

1. **Rename a single file** - Choose a file from the list and give it a new name
2. **Batch rename files** - Add prefix/suffix with sequential numbers to multiple files
3. **Remove spaces** - Replace all spaces with underscores
4. **Change extensions** - Convert all files with one extension to another
5. **Convert to lowercase** - Make all filenames lowercase
6. **Exit** - Close the program

##  What I Learned
- Using Node.js `fs/promises` for async file operations
- Working with the `path` module for cross-platform file paths
- Reading directories and filtering files
- String manipulation for filename transformations
- Error handling for file operations
- Preventing file overwrites with existence checks
- Building interactive CLI menus
- Async/await patterns for file system operations

##  How It Works

### File Operations Flow:
1. **Read Directory** - Uses `fs.readdir()` to list files
2. **Filter Files** - Removes hidden files and directories
3. **Display Options** - Shows numbered list of files
4. **User Selection** - Gets user choice and parameters
5. **Validate** - Checks if operation is safe
6. **Execute** - Performs rename using `fs.rename()`
7. **Confirm** - Shows success/error messages

### Batch Rename Logic:
```typescript
// For files: photo1.jpg, photo2.jpg, photo3.jpg
// With prefix: "vacation_", suffix: "_2024", start: 1

vacation_001_2024.jpg
vacation_002_2024.jpg
vacation_003_2024.jpg
```

##  Important Notes

- **Backup First!** Always backup important files before batch operations
- **Test in Safe Directory** Try it on test files first
- **Can't Undo** File renaming is permanent (no undo feature)
- **Case Sensitive** Some operations depend on your operating system
- **Hidden Files** Automatically skipped (files starting with .)

##  Future Improvements
- Add undo functionality
- Support for regex patterns
- Preview mode before renaming
- Recursive directory support
- Save/load rename presets
- Add date/time stamps to filenames
- Search and replace in filenames
- File size and type filtering
- Dry-run mode to test operations

##  Use Cases

✅ **Organizing Photos** - Rename vacation photos with dates and locations  
✅ **Cleaning Downloads** - Remove spaces and standardize names  
✅ **Converting Files** - Change extensions in bulk  
✅ **Project Files** - Standardize naming conventions  
✅ **Music Library** - Organize song files  
✅ **Document Management** - Make filenames consistent  

##  Troubleshooting

**Problem:** "Cannot read directory"
- **Solution:** Make sure the path exists and you have read permissions

**Problem:** "File already exists"
- **Solution:** The target filename is taken, choose a different name

**Problem:** "Permission denied"
- **Solution:** You need write permissions for that directory

**Problem:** No files showing
- **Solution:** Check if directory has files (hidden files are filtered out)

##  Challenge Info
**Day:** 3/300  
**Sprint:** 1 - Foundations  
**Date:** Sun Feb 8, 2026 
**Previous Day:** [Day 2 - Password Generator](../day-002-password-generator)  
**Next Day:** [Day 4 - Weather API Fetcher](../day-004-weather-api)  

---

Part of my 300 Days of Code Challenge! 
