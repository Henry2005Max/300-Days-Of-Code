# 📦 File Upload API (Multer + Express + SQLite)

A structured file upload system using Express, Multer, and SQLite for handling avatars and documents with validation, storage, and metadata tracking.

---

## 🚀 Features

- Single avatar upload
- Multiple document uploads
- File validation (type + size)
- SQLite metadata storage
- File deletion (DB + disk)
- Upload stats
- Category-based filtering
- Clean API responses

---

## 📁 Project Structure

src/
├── routes/
│   └── uploads.ts
├── middleware/
│   └── upload.ts
├── db/
│   └── database.ts
├── types/
│   └── index.ts
├── uploads/
│   ├── avatars/
│   └── documents/

---

## ⚙️ Environment Variables

PORT=3000  
AVATAR_DIR=./uploads/avatars  
DOCUMENT_DIR=./uploads/documents  
MAX_FILES=5  

---

## 🧠 Core Flow

1. Request comes in as multipart/form-data  
2. Multer middleware handles:
   - Validation (size/type)
   - Storage to disk  
3. File metadata is saved to DB  
4. API returns structured response with file URL  

---

## 📡 API Endpoints

---

### POST /uploads/avatar

Single file upload

Field name: avatar  

Success:
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": { ... }
}

Errors:
- 413 → File too large  
- 400 → Invalid file / missing file  

---

### POST /uploads/documents

Multiple file upload  

Field name: documents  
Max files: MAX_FILES  

Success:
{
  "success": true,
  "message": "X file(s) uploaded successfully",
  "data": [...],
  "meta": { "count": X }
}

Errors:
- 413 → File too large  
- 400 → Too many files / invalid input  

---

### GET /uploads

Query:
- category (optional)
- limit (max 50)

Response:
{
  "success": true,
  "data": [...],
  "meta": {
    "total": number,
    "count": number
  }
}

---

### GET /uploads/stats

Response:
{
  "success": true,
  "data": {
    "totalFiles": number,
    "totalSize": "formatted",
    "totalSizeBytes": number,
    "byCategory": [...]
  }
}

---

### GET /uploads/:id

Response:
{
  "success": true,
  "data": { ... }
}

Errors:
- 400 → Invalid ID  
- 404 → Not found  

---

### DELETE /uploads/:id

Deletes DB record first, then file from disk  

Response:
{
  "success": true,
  "message": "File deleted",
  "deletedFile": "filename"
}

---

## 🧩 Key Concepts

### Categories
- avatar → stored in AVATAR_DIR  
- document → stored in DOCUMENT_DIR  

---

### File Validation

Handled by Multer:
- LIMIT_FILE_SIZE  
- LIMIT_FILE_COUNT  
- LIMIT_UNEXPECTED_FILE  
- Custom fileFilter  

---

### Database Schema

CREATE TABLE uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name TEXT,
  stored_name TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  category TEXT,
  uploader_ip TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

---

### File URL Generation

Uses request base URL:

req.protocol + "://" + req.get("host")

---

### Deletion Strategy

1. Delete DB record  
2. Delete file from disk  

Prevents broken DB references.

---

## 🧪 Testing

Use Postman or similar:

Avatar:
- POST → form-data → key: avatar  

Documents:
- POST → form-data → key: documents (multiple)

---

## 📦 Dependencies

express  
multer  
better-sqlite3  

Dev:
typescript  
@types/express  
@types/multer  

---

## 🔮 Improvements

- Cloud storage (S3)
- Image optimization
- Authentication
- Rate limiting
- Virus scanning

---

## 🧾 Summary

A clean, scalable file upload system with validation, storage, and metadata tracking using Multer and Express.
