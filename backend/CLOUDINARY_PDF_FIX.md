# 🔧 Fixing Cloudinary PDF 401 Error

## Problem
Cloudinary free accounts **disable PDF delivery by default** for security reasons. Even though PDFs can be uploaded, they return 401 errors when accessed via public URLs.

## Solution: Enable PDF Delivery in Cloudinary

### Steps to Fix:

1. **Log in to Cloudinary Dashboard**
   - Go to: https://cloudinary.com/console
   - Sign in with your account

2. **Navigate to Security Settings**
   - Click on **Settings** (gear icon) in the top menu
   - Go to **Security** tab
   - Scroll down to find **"PDF and ZIP files delivery"** section

3. **Enable PDF Delivery**
   - Check the box: **"Allow delivery of PDF and ZIP files"**
   - Click **Save**
   - Confirm that you understand the terms of service

4. **Wait for Changes to Propagate**
   - Changes may take 1-2 minutes to take effect
   - Clear your browser cache

### After Enabling:

✅ All PDF files will be publicly accessible  
✅ No more 401 errors  
✅ PDFs will work in Chrome PDF viewer  
✅ Direct download links will work  

## Verification

After enabling, test the URL:
```
https://res.cloudinary.com/dftkeoquo/raw/upload/v1765264029/campus_buddy/certificates/CERT-IPP-STU012-INT007-2025.pdf
```

It should load without 401 errors.

## Note

This is a **one-time account setting**. Once enabled, all future PDF uploads will be accessible by default.

