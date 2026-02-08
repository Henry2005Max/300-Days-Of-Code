#!/usr/bin/env node

// File Renamer using fs/promises
// Day 3 of 300 Days of Code Challenge

import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to list files in a directory
async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(file => {
      // Filter out hidden files and directories
      return !file.startsWith('.');
    });
  } catch (error) {
    throw new Error(`Cannot read directory: ${dirPath}`);
  }
}

// Function to display files with numbers
function displayFiles(files: string[], directory: string): void {
  console.log('\n📁 Files in directory:');
  console.log(`📂 ${directory}\n`);
  
  if (files.length === 0) {
    console.log('   (No files found)');
    return;
  }

  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log('');
}

// Function to rename a single file
async function renameSingleFile(
  dirPath: string,
  oldName: string,
  newName: string
): Promise<boolean> {
  try {
    const oldPath = path.join(dirPath, oldName);
    const newPath = path.join(dirPath, newName);

    // Check if new file already exists
    try {
      await fs.access(newPath);
      console.log(`\n❌ Error: File "${newName}" already exists!`);
      return false;
    } catch {
      // File doesn't exist, safe to rename
    }

    await fs.rename(oldPath, newPath);
    console.log(`\n✅ Renamed: "${oldName}" → "${newName}"`);
    return true;
  } catch (error) {
    console.log(`\n❌ Error renaming file: ${error}`);
    return false;
  }
}

// Function to batch rename files
async function batchRename(
  dirPath: string,
  files: string[],
  prefix: string,
  suffix: string,
  startNumber: number
): Promise<number> {
  let successCount = 0;

  console.log('\n🔄 Starting batch rename...\n');

  for (let i = 0; i < files.length; i++) {
    const oldName = files[i];
    const fileExtension = path.extname(oldName);
    const baseName = path.basename(oldName, fileExtension);
    
    // Create new name with prefix, number, suffix
    const paddedNumber = String(startNumber + i).padStart(3, '0');
    const newName = `${prefix}${paddedNumber}${suffix}${fileExtension}`;

    const oldPath = path.join(dirPath, oldName);
    const newPath = path.join(dirPath, newName);

    try {
      await fs.rename(oldPath, newPath);
      console.log(`   ✅ ${oldName} → ${newName}`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ Failed: ${oldName}`);
    }
  }

  console.log(`\n🎉 Successfully renamed ${successCount}/${files.length} files!`);
  return successCount;
}

// Function to remove spaces from filenames
async function removeSpaces(dirPath: string, files: string[]): Promise<number> {
  let successCount = 0;

  console.log('\n🔄 Removing spaces from filenames...\n');

  for (const file of files) {
    if (file.includes(' ')) {
      const newName = file.replace(/ /g, '_');
      
      try {
        const oldPath = path.join(dirPath, file);
        const newPath = path.join(dirPath, newName);
        
        await fs.rename(oldPath, newPath);
        console.log(`   ✅ ${file} → ${newName}`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ Failed: ${file}`);
      }
    }
  }

  if (successCount === 0) {
    console.log('   No files with spaces found.');
  } else {
    console.log(`\n🎉 Removed spaces from ${successCount} file(s)!`);
  }

  return successCount;
}

// Function to change file extensions
async function changeExtension(
  dirPath: string,
  files: string[],
  oldExt: string,
  newExt: string
): Promise<number> {
  let successCount = 0;

  console.log(`\n🔄 Changing extension from "${oldExt}" to "${newExt}"...\n`);

  // Ensure extensions start with a dot
  if (!oldExt.startsWith('.')) oldExt = '.' + oldExt;
  if (!newExt.startsWith('.')) newExt = '.' + newExt;

  for (const file of files) {
    if (file.endsWith(oldExt)) {
      const baseName = path.basename(file, oldExt);
      const newName = baseName + newExt;

      try {
        const oldPath = path.join(dirPath, file);
        const newPath = path.join(dirPath, newName);
        
        await fs.rename(oldPath, newPath);
        console.log(`   ✅ ${file} → ${newName}`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ Failed: ${file}`);
      }
    }
  }

  if (successCount === 0) {
    console.log(`   No files with "${oldExt}" extension found.`);
  } else {
    console.log(`\n🎉 Changed extension for ${successCount} file(s)!`);
  }

  return successCount;
}

// Function to convert to lowercase
async function convertToLowercase(dirPath: string, files: string[]): Promise<number> {
  let successCount = 0;

  console.log('\n🔄 Converting filenames to lowercase...\n');

  for (const file of files) {
    const newName = file.toLowerCase();
    
    if (file !== newName) {
      try {
        const oldPath = path.join(dirPath, file);
        const newPath = path.join(dirPath, newName);
        
        await fs.rename(oldPath, newPath);
        console.log(`   ✅ ${file} → ${newName}`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ Failed: ${file}`);
      }
    }
  }

  if (successCount === 0) {
    console.log('   All filenames are already lowercase.');
  } else {
    console.log(`\n🎉 Converted ${successCount} filename(s) to lowercase!`);
  }

  return successCount;
}

// Main application
async function runFileRenamer() {
  console.clear();
  console.log('='.repeat(60));
  console.log('📝 FILE RENAMER - ORGANIZE YOUR FILES! 📝');
  console.log('='.repeat(60));
  console.log('\nManage and rename files easily!\n');
  console.log('='.repeat(60));

  let continueRunning = true;

  while (continueRunning) {
    try {
      console.log('\n📋 MAIN MENU\n');
      console.log('   1. Rename a single file');
      console.log('   2. Batch rename files (add prefix/suffix with numbers)');
      console.log('   3. Remove spaces from filenames');
      console.log('   4. Change file extensions');
      console.log('   5. Convert filenames to lowercase');
      console.log('   6. Exit\n');

      const choice = await askQuestion('Choose an option (1-6): ');

      if (choice === '6') {
        console.log('\n👋 Thanks for using File Renamer! Goodbye!\n');
        continueRunning = false;
        break;
      }

      // Get directory path
      const dirInput = await askQuestion('\nEnter directory path (or "." for current directory): ');
      const dirPath = dirInput === '.' ? process.cwd() : dirInput;

      // List files
      const files = await listFiles(dirPath);
      displayFiles(files, dirPath);

      if (files.length === 0) {
        console.log('⚠️  No files to rename. Try a different directory.\n');
        continue;
      }

      switch (choice) {
        case '1': {
          // Single file rename
          const fileNumber = await askQuestion('Enter file number to rename: ');
          const fileIndex = parseInt(fileNumber) - 1;

          if (fileIndex < 0 || fileIndex >= files.length) {
            console.log('\n❌ Invalid file number!');
            break;
          }

          const oldName = files[fileIndex];
          const newName = await askQuestion(`Enter new name for "${oldName}": `);

          await renameSingleFile(dirPath, oldName, newName);
          break;
        }

        case '2': {
          // Batch rename
          const prefix = await askQuestion('Enter prefix (or leave empty): ');
          const suffix = await askQuestion('Enter suffix (or leave empty): ');
          const startNum = await askQuestion('Starting number (default 1): ');
          const startNumber = startNum ? parseInt(startNum) : 1;

          const confirm = await askQuestion(`\n⚠️  This will rename ${files.length} files. Continue? (yes/no): `);
          
          if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            await batchRename(dirPath, files, prefix, suffix, startNumber);
          } else {
            console.log('\n❌ Batch rename cancelled.');
          }
          break;
        }

        case '3': {
          // Remove spaces
          const confirm = await askQuestion('\n⚠️  This will replace spaces with underscores. Continue? (yes/no): ');
          
          if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            await removeSpaces(dirPath, files);
          } else {
            console.log('\n❌ Operation cancelled.');
          }
          break;
        }

        case '4': {
          // Change extension
          const oldExt = await askQuestion('Enter current extension (e.g., txt): ');
          const newExt = await askQuestion('Enter new extension (e.g., md): ');

          const confirm = await askQuestion(`\n⚠️  This will change .${oldExt} to .${newExt}. Continue? (yes/no): `);
          
          if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            await changeExtension(dirPath, files, oldExt, newExt);
          } else {
            console.log('\n❌ Operation cancelled.');
          }
          break;
        }

        case '5': {
          // Convert to lowercase
          const confirm = await askQuestion('\n⚠️  This will convert all filenames to lowercase. Continue? (yes/no): ');
          
          if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            await convertToLowercase(dirPath, files);
          } else {
            console.log('\n❌ Operation cancelled.');
          }
          break;
        }

        default:
          console.log('\n❌ Invalid option! Please choose 1-6.');
      }

      // Ask to continue
      const again = await askQuestion('\nPerform another operation? (yes/no): ');
      if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
        console.log('\n👋 Thanks for using File Renamer! Goodbye!\n');
        continueRunning = false;
      }

    } catch (error) {
      if (error instanceof Error) {
        console.log(`\n❌ Error: ${error.message}\n`);
      }
    }
  }
