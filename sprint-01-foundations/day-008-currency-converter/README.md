# Day 8: Currency Converter (NGN Focus + API)

##  Description
A Nigerian Naira focused currency converter that fetches live exchange rates! Convert between world currencies with real-time data, view NGN rates at a glance, and use the quick reference table for common NGN conversions.

##  Features
-  **NGN Focused** - Built for Nigerians, shows Naira prominently
-  **Convert Any Currency** - 12 supported currencies
-  **Live Rates** - Fetches from exchangerate-api.com
-  **Fallback Rates** - Works offline with approximate rates
-  **Quick Reference** - NGN → USD table for common amounts
-  **African Currencies** - NGN, GHS, KES, ZAR, EGP included
-  **Color Coded** - Beautiful terminal output
-  **Input Validation** - Handles invalid currency codes

## 🛠️ Technologies Used
- TypeScript
- Node.js
- Axios (live rate fetching)
- Chalk (terminal colors)
- exchangerate-api.com (free API)

## 🌍 Supported Currencies

| Code | Currency |
|------|----------|
| NGN | 🇳🇬 Nigerian Naira |
| USD | 🇺🇸 US Dollar |
| EUR | 🇪🇺 Euro |
| GBP | 🇬🇧 British Pound |
| CAD | 🇨🇦 Canadian Dollar |
| AUD | 🇦🇺 Australian Dollar |
| JPY | 🇯🇵 Japanese Yen |
| CNY | 🇨🇳 Chinese Yuan |
| GHS | 🇬🇭 Ghanaian Cedi |
| KES | 🇰🇪 Kenyan Shilling |
| ZAR | 🇿🇦 South African Rand |
| EGP | 🇪🇬 Egyptian Pound |

##  Installation

```bash
npm install
```

##  How to Run

```bash
npx ts-node currency-converter.ts
```

##  Example Output

### Convert NGN to USD:
```
From currency: NGN
To currency: USD
Amount: 50000

═══════════════════════════════════════════════════════
  💱 CONVERSION RESULT

  50,000.00 NGN → 31.65 USD

  🇳🇬 Nigerian Naira
  🇺🇸 US Dollar

  Exchange Rate: 1 NGN = 0.00063 USD
  ✅ Live rate as of 2/12/2026
═══════════════════════════════════════════════════════
```

### NGN Quick Reference:
```
   QUICK NGN CONVERTER

  NGN → USD Quick Reference:

  ₦1,000        $0.63
  ₦5,000        $3.16
  ₦10,000       $6.33
  ₦50,000       $31.65
  ₦100,000      $63.29
  ₦500,000      $316.46
  ₦1,000,000    $632.91
```

##  What I Learned
- Fetching live financial data from APIs
- Fallback data for offline/error scenarios
- Currency conversion mathematics
- Formatting numbers for different currencies
- Working with exchange rate APIs
- Error handling with timeout
- Building reference tables in terminal
- African currency codes

## Challenge Info
**Day:** 8/300  
**Sprint:** 1 - Foundations  
**Date:** FRI, FEB 13
**Previous Day:** [Day 7 - BMI Calculator](../day-007-bmi-calculator)  
**Next Day:** [Day 9 - TypeScript Encryption](../day-009-encryption)  

---

Part of my 300 Days of Code Challenge! 
