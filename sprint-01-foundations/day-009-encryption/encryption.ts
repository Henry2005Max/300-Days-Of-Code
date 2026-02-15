
// TypeScript Encryption Tool using crypto module
// Day 9 of 300 Days of Code Challenge

import * as crypto from 'crypto';
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

// ─ Hashing 

function hashText(text: string, algorithm: string): string {
  return crypto.createHash(algorithm).update(text).digest('hex');
}

function displayHashes(text: string): void {
  console.log(chalk.bold.cyan('\n  🔐 HASH RESULTS\n'));
  console.log(chalk.gray('  ' + '─'.repeat(55)));
  console.log(chalk.white(`  Input: `) + chalk.yellow(`"${text}"`));
  console.log(chalk.gray('  ' + '─'.repeat(55)));
  console.log(chalk.white('  MD5:    ') + chalk.green(hashText(text, 'md5')));
  console.log(chalk.white('  SHA1:   ') + chalk.green(hashText(text, 'sha1')));
  console.log(chalk.white('  SHA256: ') + chalk.green(hashText(text, 'sha256')));
  console.log(chalk.white('  SHA512: ') + chalk.green(hashText(text, 'sha512').slice(0, 64) + '...'));
  console.log(chalk.gray('  ' + '─'.repeat(55)));
  console.log(chalk.gray('\n  ⚠️  Hashes are ONE WAY - cannot be reversed!\n'));
}

//  Symmetric Encryption (AES) 

function encryptAES(text: string, password: string): string {
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptAES(encryptedText: string, password: string): string {
  const [ivHex, encryptedHex] = encryptedText.split(':');
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString();
}

//  Base64 

function encodeBase64(text: string): string {
  return Buffer.from(text).toString('base64');
}

function decodeBase64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

// Caesar Cipher 

function caesarCipher(text: string, shift: number, decrypt: boolean = false): string {
  const actualShift = decrypt ? (26 - shift) % 26 : shift;
  return text.split('').map(char => {
    if (char.match(/[a-z]/)) {
      return String.fromCharCode(((char.charCodeAt(0) - 97 + actualShift) % 26) + 97);
    } else if (char.match(/[A-Z]/)) {
      return String.fromCharCode(((char.charCodeAt(0) - 65 + actualShift) % 26) + 65);
    }
    return char;
  }).join('');
}

//  Random Token Generator 

function generateToken(bytes: number): string {
  return crypto.randomBytes(bytes).toString('hex');
}

function generateUUID(): string {
  return crypto.randomUUID();
}

//  Display functions

function displayEncryption(original: string, encrypted: string, method: string): void {
  console.log(chalk.gray('\n  ' + '─'.repeat(55)));
  console.log(chalk.bold.green(`  🔒 ${method} ENCRYPTED\n`));
  console.log(chalk.white('  Original:  ') + chalk.yellow(`"${original}"`));
  console.log(chalk.white('  Encrypted: ') + chalk.green(encrypted));
  console.log(chalk.gray('  ' + '─'.repeat(55)));
}

function displayDecryption(encrypted: string, decrypted: string, method: string): void {
  console.log(chalk.gray('\n  ' + '─'.repeat(55)));
  console.log(chalk.bold.yellow(`  🔓 ${method} DECRYPTED\n`));
  console.log(chalk.white('  Encrypted: ') + chalk.gray(encrypted.slice(0, 40) + '...'));
  console.log(chalk.white('  Decrypted: ') + chalk.green(`"${decrypted}"`));
  console.log(chalk.gray('  ' + '─'.repeat(55)));
}

//  Main Application 

async function runEncryptionTool() {
  console.clear();
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.bold.magenta('         🔐 TYPESCRIPT ENCRYPTION TOOL 🔐'));
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.white('\n    Encrypt, decrypt, and hash with Node.js!\n'));
  console.log(chalk.bold.magenta('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n📋 MAIN MENU\n'));
    console.log(chalk.white('   1. Hash text (MD5, SHA1, SHA256, SHA512)'));
    console.log(chalk.white('   2. Encrypt text (AES-256)'));
    console.log(chalk.white('   3. Decrypt text (AES-256)'));
    console.log(chalk.white('   4. Base64 encode'));
    console.log(chalk.white('   5. Base64 decode'));
    console.log(chalk.white('   6. Caesar cipher'));
    console.log(chalk.white('   7. Generate secure token'));
    console.log(chalk.white('   8. Generate UUID'));
    console.log(chalk.white('   9. Exit\n'));

    const choice = await askQuestion(chalk.cyan('Choose an option (1-9): '));

    if (choice === '9') {
      console.log(chalk.magenta('\n👋 Stay secure! Goodbye!\n'));
      break;
    }

    try {
      switch (choice) {
        case '1': {
          const text = await askQuestion(chalk.cyan('\n  Enter text to hash: '));
          displayHashes(text);
          break;
        }

        case '2': {
          const text = await askQuestion(chalk.cyan('\n  Enter text to encrypt: '));
          const password = await askQuestion(chalk.cyan('  Enter password: '));
          const encrypted = encryptAES(text, password);
          displayEncryption(text, encrypted, 'AES-256');
          console.log(chalk.yellow('\n  💡 Save both the encrypted text AND password to decrypt later!\n'));
          break;
        }

        case '3': {
          const encrypted = await askQuestion(chalk.cyan('\n  Enter encrypted text: '));
          const password = await askQuestion(chalk.cyan('  Enter password: '));
          try {
            const decrypted = decryptAES(encrypted, password);
            displayDecryption(encrypted, decrypted, 'AES-256');
          } catch (e) {
            console.log(chalk.red('\n  ❌ Decryption failed! Wrong password or corrupted text.\n'));
          }
          break;
        }

        case '4': {
          const text = await askQuestion(chalk.cyan('\n  Enter text to encode: '));
          const encoded = encodeBase64(text);
          displayEncryption(text, encoded, 'BASE64');
          console.log(chalk.yellow('\n  💡 Base64 is encoding, NOT encryption - not secure!\n'));
          break;
        }

        case '5': {
          const encoded = await askQuestion(chalk.cyan('\n  Enter Base64 text to decode: '));
          try {
            const decoded = decodeBase64(encoded);
            displayDecryption(encoded, decoded, 'BASE64');
          } catch (e) {
            console.log(chalk.red('\n  ❌ Invalid Base64 string!\n'));
          }
          break;
        }

        case '6': {
          const text = await askQuestion(chalk.cyan('\n  Enter text: '));
          const shiftInput = await askQuestion(chalk.cyan('  Enter shift (1-25): '));
          const shift = parseInt(shiftInput);

          if (isNaN(shift) || shift < 1 || shift > 25) {
            console.log(chalk.red('\n  ❌ Shift must be between 1 and 25!\n'));
            break;
          }

          const action = await askQuestion(chalk.cyan('  Encrypt or Decrypt? (e/d): '));
          const decrypt = action.toLowerCase() === 'd';
          const result = caesarCipher(text, shift, decrypt);

          console.log(chalk.gray('\n  ' + '─'.repeat(55)));
          console.log(chalk.bold.green(`  🔤 CAESAR CIPHER (Shift: ${shift})\n`));
          console.log(chalk.white('  Input:  ') + chalk.yellow(`"${text}"`));
          console.log(chalk.white('  Output: ') + chalk.green(`"${result}"`));
          console.log(chalk.gray('  ' + '─'.repeat(55)));
          console.log(chalk.gray('\n  ⚠️  Caesar cipher is very weak - educational use only!\n'));
          break;
        }

        case '7': {
          const sizeInput = await askQuestion(chalk.cyan('\n  Token size in bytes (16/32/64): '));
          const size = parseInt(sizeInput);

          if (isNaN(size) || size < 1) {
            console.log(chalk.red('\n  ❌ Invalid size!\n'));
            break;
          }

          const token = generateToken(size);
          console.log(chalk.gray('\n  ' + '─'.repeat(55)));
          console.log(chalk.bold.green('  🎲 SECURE TOKEN GENERATED\n'));
          console.log(chalk.white('  Token: ') + chalk.green(token));
          console.log(chalk.white('  Length: ') + chalk.yellow(`${token.length} characters`));
          console.log(chalk.gray('  ' + '─'.repeat(55)));
          console.log(chalk.gray('\n  💡 Great for API keys, session tokens, secrets!\n'));
          break;
        }

        case '8': {
          const uuid = generateUUID();
          console.log(chalk.gray('\n  ' + '─'.repeat(55)));
          console.log(chalk.bold.green('  🆔 UUID GENERATED\n'));
          console.log(chalk.white('  UUID: ') + chalk.green(uuid));
          console.log(chalk.gray('  ' + '─'.repeat(55)));
          console.log(chalk.gray('\n  💡 Great for unique IDs in databases!\n'));
          break;
        }

        default:
          console.log(chalk.red('\n  ❌ Invalid option! Please choose 1-9.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  ❌ Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('Continue? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.magenta('\n👋 Stay secure! Goodbye!\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runEncryptionTool();
