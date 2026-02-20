# Day 15: QR Code Generator

##  Description
Generate QR codes for URLs, WiFi credentials, contact cards (vCard), emails, phone numbers, SMS and plain text! Save as PNG images or display directly in terminal.

##  Features
-  **Plain Text** - Any text to QR code
-  **URL** - Website links
-  **WiFi** - Share WiFi credentials instantly
-  **Email** - Pre-filled email with subject/body
-  **Phone** - Dialable phone numbers
-  **SMS** - Pre-filled text messages
-  **vCard** - Contact cards with name, phone, email
-  **Terminal Display** - See QR in terminal (no file needed)
-  **Customizable** - Set size and error correction level

##  Technologies Used
- TypeScript
- Node.js
- qrcode library
- Chalk (terminal colors)

##  Installation

```bash
npm install
```

##  How to Run

```bash
npx ts-node qr-generator.ts
```

## 💡 Example Usage

### WiFi QR Code:
```
SSID: MyHomeWiFi
Password: SecurePass123
Encryption: WPA

wifi-qr.png created!
→ Scan to connect instantly!
```

### Contact Card (vCard):
```
Name: Henry Max
Phone: +234-123-456-7890
Email: henry@example.com

 vcard-qr.png created!
→ Scan to save contact!
```

### URL:
```
URL: github.com/Henry2005Max

 url-qr.png created!
→ Scan to open website!
```

##  What I Learned
- Using the qrcode npm library
- Different QR code data formats (WiFi, vCard, mailto, tel, sms)
- URI schemes and encoding
- Image generation with Node.js
- Terminal QR code rendering
- Error correction levels (L, M, Q, H)

##  Challenge Info
**Day:** 15/300 - **WEEK 3 DAY 1!** 
**Sprint:** 1 - Foundations  
**Previous Day:** [Day 14 - Email Validator](../day-014-email-validator)  
**Next Day:** Day 16 - Joke API Fetcher  

---

Part of my 300 Days of Code Challenge! 
