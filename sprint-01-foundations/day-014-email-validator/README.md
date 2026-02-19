# Day 14: Email Validator

##  Description
A comprehensive email validator with detailed error reporting! Validate single emails or batch process from files. Includes common provider detection, detailed validation feedback, and example demonstrations.

##  Features
-  **Single Validation** - Validate one email with detailed feedback
-  **Batch Validation** - Process multiple emails from a file
-  **Detailed Errors** - Shows exactly what's wrong
-  **Provider Detection** - Identifies Gmail, Yahoo, Outlook, etc.
-  **Statistics** - Percentage of valid/invalid emails
-  **Examples** - Shows valid and invalid email formats
-  **Color Coded** - Green for valid, red for invalid

##  Technologies Used
- TypeScript
- Node.js
- Regular Expressions (Regex)
- Chalk (terminal colors)
- fs/promises (file operations)

##  Installation

```bash
npm install
```

##  How to Run

```bash
npx ts-node email-validator.ts
```

##  Example Output

### Valid Email:
```
VALID EMAIL

  Email:       henry@example.com
  Local Part:  henry
  Domain:      example.com
  TLD:         com
  Provider:    example.com (Custom/Business)
```

### Invalid Email:
```
 INVALID EMAIL

  Email:       bad@@email.com

  Issues:
    • Multiple @ symbols found
```

##  What I Learned
- Regular expressions for email validation
- String parsing and splitting
- Detailed error reporting
- Batch file processing
- Email format rules (RFC 5322)
- Common email providers

##  Challenge Info
**Day:** 14/300 - **WEEK 2 COMPLETE!**   
**Sprint:** 1 - Foundations  
**Previous Day:** [Day 13 - Markdown Parser](../day-013-markdown-parser)  
**Next Day:** Day 15 - Week 3 starts!  

---

Part of my 300 Days of Code Challenge 
