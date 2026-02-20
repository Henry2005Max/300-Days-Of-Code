// QR Code Generator
// Day 15 of 300 Days of Code Challenge

import QRCode from 'qrcode';
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

//  Generate QR Code as Image 

async function generateQRImage(
  text: string,
  filename: string = 'qrcode.png',
  options: { width?: number; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' } = {}
): Promise<void> {
  const opts = {
    width: options.width || 300,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M'
  };

  await QRCode.toFile(filename, text, opts);
}

//  Generate QR Code in Terminal 

async function generateQRTerminal(text: string): Promise<void> {
  const qrString = await QRCode.toString(text, { type: 'terminal', small: true });
  console.log('\n' + qrString);
}

// ─── Quick Presets ────────────────────────────────────────

async function generateURLQR(url: string): Promise<void> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  await generateQRImage(url, 'url-qr.png');
  console.log(chalk.green('\n  ✅ QR code saved as: url-qr.png'));
  console.log(chalk.cyan('  Scan to open: ') + chalk.white(url));
}

async function generateWiFiQR(ssid: string, password: string, encryption: string = 'WPA'): Promise<void> {
  const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
  await generateQRImage(wifiString, 'wifi-qr.png');
  console.log(chalk.green('\n  ✅ WiFi QR code saved as: wifi-qr.png'));
  console.log(chalk.cyan('  Network: ') + chalk.white(ssid));
}

async function generateEmailQR(email: string, subject?: string, body?: string): Promise<void> {
  let mailtoString = `mailto:${email}`;
  if (subject || body) {
    const params: string[] = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    mailtoString += '?' + params.join('&');
  }
  await generateQRImage(mailtoString, 'email-qr.png');
  console.log(chalk.green('\n  ✅ Email QR code saved as: email-qr.png'));
  console.log(chalk.cyan('  To: ') + chalk.white(email));
}

async function generatePhoneQR(phone: string): Promise<void> {
  const telString = `tel:${phone}`;
  await generateQRImage(telString, 'phone-qr.png');
  console.log(chalk.green('\n  ✅ Phone QR code saved as: phone-qr.png'));
  console.log(chalk.cyan('  Number: ') + chalk.white(phone));
}

async function generateSMSQR(phone: string, message?: string): Promise<void> {
  let smsString = `sms:${phone}`;
  if (message) {
    smsString += `?body=${encodeURIComponent(message)}`;
  }
  await generateQRImage(smsString, 'sms-qr.png');
  console.log(chalk.green('\n  ✅ SMS QR code saved as: sms-qr.png'));
  console.log(chalk.cyan('  Number: ') + chalk.white(phone));
}

async function generateVCardQR(name: string, phone?: string, email?: string): Promise<void> {
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
  vcard += `FN:${name}\n`;
  if (phone) vcard += `TEL:${phone}\n`;
  if (email) vcard += `EMAIL:${email}\n`;
  vcard += 'END:VCARD';

  await generateQRImage(vcard, 'vcard-qr.png');
  console.log(chalk.green('\n   vCard QR code saved as: vcard-qr.png'));
  console.log(chalk.cyan('  Contact: ') + chalk.white(name));
}

//  Display Examples 

function showExamples(): void {
  console.log(chalk.bold.cyan('\n  📱 QR CODE EXAMPLES\n'));

  console.log(chalk.yellow('  URL:'));
  console.log(chalk.white('    https://github.com/Henry2005max\n'));

  console.log(chalk.yellow('  WiFi:'));
  console.log(chalk.white('    SSID: MyNetwork'));
  console.log(chalk.white('    Password: MyPassword123\n'));

  console.log(chalk.yellow('  Email:'));
  console.log(chalk.white('    To: contact@example.com'));
  console.log(chalk.white('    Subject: Hello\n'));

  console.log(chalk.yellow('  Phone:'));
  console.log(chalk.white('    +234-123-456-7890\n'));

  console.log(chalk.yellow('  SMS:'));
  console.log(chalk.white('    Phone: +234-123-456-7890'));
  console.log(chalk.white('    Message: Hello World\n'));

  console.log(chalk.yellow('  vCard (Contact):'));
  console.log(chalk.white('    Name: John Doe'));
  console.log(chalk.white('    Phone: +234-123-456-7890'));
  console.log(chalk.white('    Email: john@example.com\n'));
}

// ─── Main Application ─────────────────────────────────────

async function runQRGenerator() {
  console.clear();
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.bold.magenta('          📱 QR CODE GENERATOR 📱'));
  console.log(chalk.bold.magenta('═'.repeat(55)));
  console.log(chalk.white('\n   Generate QR codes for URLs, WiFi, contacts & more!\n'));
  console.log(chalk.bold.magenta('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n📋 MENU\n'));
    console.log(chalk.white('   1. Plain text QR code'));
    console.log(chalk.white('   2. URL QR code'));
    console.log(chalk.white('   3. WiFi QR code'));
    console.log(chalk.white('   4. Email QR code'));
    console.log(chalk.white('   5. Phone QR code'));
    console.log(chalk.white('   6. SMS QR code'));
    console.log(chalk.white('   7. vCard (Contact) QR code'));
    console.log(chalk.white('   8. Display in terminal'));
    console.log(chalk.white('   9. Show examples'));
    console.log(chalk.white('   10. Exit\n'));

    const choice = await askQuestion(chalk.cyan('Choose an option (1-10): '));

    if (choice === '10') {
      console.log(chalk.magenta('\n👋 Keep scanning! Goodbye!\n'));
      break;
    }

    try {
      switch (choice) {
        case '1': {
          const text = await askQuestion(chalk.cyan('\n  Enter text: '));
          if (!text) {
            console.log(chalk.red('\n  ❌ Text cannot be empty!\n'));
            break;
          }

          const filename = await askQuestion(chalk.cyan('  Output filename (default: qrcode.png): ')) || 'qrcode.png';
          
          console.log(chalk.cyan('\n  🔄 Generating QR code...'));
          await generateQRImage(text, filename);
          console.log(chalk.green(`\n  ✅ QR code saved as: ${filename}\n`));
          break;
        }

        case '2': {
          const url = await askQuestion(chalk.cyan('\n  Enter URL: '));
          if (!url) {
            console.log(chalk.red('\n  ❌ URL cannot be empty!\n'));
            break;
          }

          console.log(chalk.cyan('\n  🔄 Generating QR code...'));
          await generateURLQR(url);
          console.log('');
          break;
        }

        case '3': {
          const ssid = await askQuestion(chalk.cyan('\n  WiFi Network Name (SSID): '));
          const password = await askQuestion(chalk.cyan('  WiFi Password: '));
          const encryption = await askQuestion(chalk.cyan('  Encryption (WPA/WEP/nopass) [default: WPA]: ')) || 'WPA';

          if (!ssid) {
            console.log(chalk.red('\n  ❌ SSID cannot be empty!\n'));
            break;
          }

          console.log(chalk.cyan('\n  🔄 Generating WiFi QR code...'));
          await generateWiFiQR(ssid, password, encryption);
          console.log('');
          break;
        }

        case '4': {
          const email = await askQuestion(chalk.cyan('\n  Email address: '));
          const subject = await askQuestion(chalk.cyan('  Subject (optional): '));
          const body = await askQuestion(chalk.cyan('  Message body (optional): '));

          if (!email) {
            console.log(chalk.red('\n  ❌ Email cannot be empty!\n'));
            break;
          }

          console.log(chalk.cyan('\n  🔄 Generating email QR code...'));
          await generateEmailQR(email, subject || undefined, body || undefined);
          console.log('');
          break;
        }

        case '5': {
          const phone = await askQuestion(chalk.cyan('\n  Phone number (e.g., +234-123-456-7890): '));

          if (!phone) {
            console.log(chalk.red('\n  ❌ Phone cannot be empty!\n'));
            break;
          }

          console.log(chalk.cyan('\n  🔄 Generating phone QR code...'));
          await generatePhoneQR(phone);
          console.log('');
          break;
        }

        case '6': {
          const phone = await askQuestion(chalk.cyan('\n  Phone number: '));
          const message = await askQuestion(chalk.cyan('  Message (optional): '));

          if (!phone) {
            console.log(chalk.red('\n  ❌ Phone cannot be empty!\n'));
            break;
          }

          console.log(chalk.cyan('\n  🔄 Generating SMS QR code...'));
          await generateSMSQR(phone, message || undefined);
          console.log('');
          break;
        }

        case '7': {
          const name = await askQuestion(chalk.cyan('\n  Contact name: '));
          const phone = await askQuestion(chalk.cyan('  Phone number (optional): '));
          const email = await askQuestion(chalk.cyan('  Email (optional): '));

          if (!name) {
            console.log(chalk.red('\n  ❌ Name cannot be empty!\n'));
            break;
          }

          console.log(chalk.cyan('\n  🔄 Generating vCard QR code...'));
          await generateVCardQR(name, phone || undefined, email || undefined);
          console.log('');
          break;
        }

        case '8': {
          const text = await askQuestion(chalk.cyan('\n  Enter text to display as QR in terminal: '));

          if (!text) {
            console.log(chalk.red('\n  ❌ Text cannot be empty!\n'));
            break;
          }

          await generateQRTerminal(text);
          console.log('');
          break;
        }

        case '9': {
          showExamples();
          break;
        }

        default:
          console.log(chalk.red('\n  ❌ Invalid option! Please choose 1-10.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  ❌ Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('Generate another? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.magenta('\n👋 Keep scanning! Goodbye!\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runQRGenerator();
