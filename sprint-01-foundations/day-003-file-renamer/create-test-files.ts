#!/usr/bin/env node

// Test Files Creator - Creates sample files to test the file renamer
// Run this before testing your file renamer!

import * as fs from 'fs/promises';
import * as path from 'path';

async function createTestFiles() {
  console.log('🔧 Creating test files for File Renamer...\n');

  // Create test directory
  const testDir = path.join(process.cwd(), 'test-files');
  
  try {
    await fs.mkdir(testDir);
    console.log('✅ Created directory: test-files/\n');
  } catch (error) {
    console.log('📁 Directory already exists, using existing one\n');
  }

  // Sample files to create
  const testFiles = [
    'my document.txt',
    'final report.txt',
    'meeting notes.txt',
    'Project Plan.txt',
    'BUDGET 2024.txt',
    'photo 001.jpg',
    'photo 002.jpg',
    'photo 003.jpg',
    'Video File.mp4',
    'Song Name.mp3'
  ];

  console.log('Creating test files:\n');

  for (const fileName of testFiles) {
    const filePath = path.join(testDir, fileName);
    const content = `This is a test file: ${fileName}`;
    
    try {
      await fs.writeFile(filePath, content);
      console.log(`   ✅ ${fileName}`);
    } catch (error) {
      console.log(`   ❌ Failed to create: ${fileName}`);
    }
  }

  console.log('\n🎉 Test files created successfully!');
  console.log(`📂 Location: ${testDir}`);
  console.log('\n💡 Now you can test your file renamer with these files!');
  console.log('   Use "./test-files" as the directory path\n');
}

createTestFiles();
