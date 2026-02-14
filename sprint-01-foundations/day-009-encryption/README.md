# Day 9: TypeScript Encryption Tool (crypto module)

## Description
A comprehensive encryption and security tool built with TypeScript using Node.js's built-in crypto module. Hash text, encrypt/decrypt with AES-256, encode/decode Base64, use Caesar cipher, and generate secure tokens!

##  Features
-  **Hashing** - MD5, SHA1, SHA256, SHA512
-  **AES-256 Encryption** - Industry standard encryption
-  **AES-256 Decryption** - Decrypt your messages
-  **Base64 Encode/Decode** - Encoding for data transfer
-  **Caesar Cipher** - Classic substitution cipher
-  **Secure Token Generator** - For API keys and sessions
-  **UUID Generator** - Unique identifiers for databases
-  **Color Coded Output** - Beautiful terminal display

##  Technologies Used
- TypeScript
- Node.js built-in `crypto` module
- Chalk (terminal colors)
- No external crypto libraries needed!

##  Installation

```bash
npm install
```

##  How to Run

```bash
npx ts-node encryption.ts
```

##  Example Usage

### Hashing:
```
Input: "Hello World"

MD5:    b10a8db164e0754105b7a99be72e3fe5
SHA1:   0a4d55a8d778e5022fab701977c5d840bbc486d0
SHA256: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
SHA512: 2c74fd17edafd80e8447b0d46741ee24...
```

### AES-256 Encryption:
```
Text: "Secret message"
Password: "mypassword"

Encrypted: a3f8b2c1d4e5f6a7:8b9c0d1e2f3a4b5c...
```

### Caesar Cipher:
```
Input: "Hello World"
Shift: 3
Encrypted: "Khoor Zruog"
```

### Token Generator:
```
Token: a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5
Length: 32 characters
```

### UUID Generator:
```
UUID: 550e8400-e29b-41d4-a716-446655440000
```

##  What I Learned
- Using Node.js built-in crypto module
- Difference between hashing and encryption
- AES-256-CBC encryption algorithm
- Initialization Vectors (IV) for security
- Base64 encoding vs encryption
- Caesar cipher implementation
- Cryptographically secure random generation
- scrypt for key derivation from passwords

##  Key Concepts

### Hashing vs Encryption:
```
Hashing:     One way - cannot be reversed
             Used for: passwords, file verification

Encryption:  Two way - can be decrypted with key
             Used for: messages, sensitive data
```

### AES-256 Process:
```
Password → scrypt → 256-bit key
Random IV (16 bytes) generated
Text + Key + IV → Encrypted output
Store: IV + Encrypted (needed for decryption)
```

##  Security Notes
- AES-256 is industry standard ✅
- MD5 and SHA1 are outdated for passwords ❌
- Caesar cipher is for education only ❌
- Base64 is NOT encryption ❌
- Always use strong passwords ✅

##  Challenge Info
**Day:** 9/300  
**Sprint:** 1 - Foundations  
**Date:** FEB 14, 2026
**Previous Day:** [Day 8 - Currency Converter](../day-008-currency-converter)  
**Next Day:** [Day 10 - Jest Tests](../day-010-jest-tests)  

---

Part of my 300 Days of Code Challenge
