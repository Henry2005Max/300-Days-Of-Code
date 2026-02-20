## Day 15 - February 20
**Project:** QR Code Generator
**Time Spent:** 4hrs

### What I Built
- Interactive CLI with 10 menu options
- Plain text to QR code
- URL QR code (auto-adds https://)
- WiFi QR code (SSID, password, encryption type)
- Email QR code (with optional subject and body)
- Phone number QR code
- SMS QR code (with optional pre-filled message)
- vCard QR code (contact card with name, phone, email)
- Terminal display (scan directly from terminal!)
- Examples viewer showing all QR formats

### What I Learned
- Using the qrcode npm library with TypeScript
- Different QR data formats (WIFI:, mailto:, tel:, sms:, BEGIN:VCARD)
- URI encoding with encodeURIComponent for special characters
- vCard 3.0 format for contact cards
- Error correction levels (L, M, Q, H)
- Chalk library for colored terminal output

### Challenges
None

### Tomorrow
Day 16: Joke API Fetcher
