# Cloudinary Integration - Complete Setup Guide

## 🎯 Overview

CampusBuddy now uses **Cloudinary** for all media uploads (profile pictures and PDF resumes) instead of local file storage. This provides:

- ✅ **Scalable cloud storage** - No server disk space limitations
- ✅ **Global CDN delivery** - Fast loading from anywhere in the world
- ✅ **Automatic optimization** - Images are auto-compressed and served in optimal formats
- ✅ **Secure uploads** - Files are stored securely with proper access controls
- ✅ **Easy management** - View, delete, and manage all uploads from Cloudinary dashboard

---

## 📋 Configuration

### Cloudinary Account Details
- **Cloud Name**: `your_cloud_name`
- **API Key**: `your_api_key`
- **API Secret**: `your_api_secret`
- **Upload Preset**: `your_upload_preset` (Unsigned mode)

### Environment Variables

#### Backend (`.env`)
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (`.env`)
```env
# Cloudinary Configuration (Frontend - NO SECRETS!)
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## 🏗️ Implementation Details

### Backend Changes

#### 1. **New Utility Module** (`backend/utils/cloudinary.js`)
- `uploadToCloudinary(filePath, options)` - Upload files to Cloudinary
- `deleteFromCloudinary(publicId, resourceType)` - Delete files from Cloudinary
- `extractPublicId(url)` - Extract public ID from Cloudinary URL

#### 2. **Updated Routes** (`backend/routes/students.js`)

**Profile Picture Upload** (`POST /students/upload-profile-picture`):
- Accepts image files (JPEG, PNG, etc.)
- Uploads to `campus_buddy/profile_pictures` folder
- Auto-resizes to 500x500px with face detection
- Deletes old profile picture when uploading new one
- Returns Cloudinary URL

**PDF Resume Upload** (`POST /students/upload-pdf-resume`):
- Accepts PDF files up to 10MB
- Uploads to `campus_buddy/resumes` folder
- Stores original filename and metadata
- Only 1 resume per student allowed
- Returns Cloudinary URL

**Delete PDF Resume** (`DELETE /students/pdf-resume/:resumeId`):
- Removes from database
- Deletes from Cloudinary cloud storage

#### 3. **Multer Configuration**
- Changed from `diskStorage` to `memoryStorage`
- Files are temporarily stored in memory
- Converted to base64 and uploaded to Cloudinary
- No local file storage needed

### Frontend Changes

#### **StudentProfile.jsx**
- Updated profile picture display to use Cloudinary URLs
- Updated PDF resume view links to use Cloudinary URLs
- Removed localhost path references
- Removed timestamp cache-busting (Cloudinary handles caching)

---

## 📁 Folder Structure in Cloudinary

```
campus_buddy/
├── profile_pictures/
│   ├── profile_STU001_1234567890.jpg
│   ├── profile_STU002_1234567891.jpg
│   └── ...
└── resumes/
    ├── resume_STU001_1234567890.pdf
    ├── resume_STU002_1234567891.pdf
    └── ...
```

---

## 🔒 Security Features

1. **API Secret Protection**
   - API secret is ONLY in backend `.env`
   - Never exposed to frontend
   - Protected by `.gitignore`

2. **Unsigned Uploads**
   - Frontend can upload directly using upload preset
   - No need to expose API credentials
   - Preset controls allowed file types and sizes

3. **Access Control**
   - Only authenticated students can upload
   - Students can only delete their own files
   - Admins/recruiters have read-only access

---

## 🚀 How to Use

### For Students

#### Upload Profile Picture:
1. Go to "My Profile"
2. Click "Actions" → "Edit Profile"
3. Click on profile picture
4. Select image file
5. Image uploads automatically to Cloudinary

#### Upload Resume PDF:
1. Go to "My Profile"
2. Click "Upload Resume (PDF)" button
3. Select PDF file (max 10MB)
4. File uploads to Cloudinary
5. View or delete anytime

### For Developers

#### Upload a File Programmatically:
```javascript
const { uploadToCloudinary } = require('./utils/cloudinary');

// Upload from file path
const result = await uploadToCloudinary('/path/to/file.jpg', {
  folder: 'campus_buddy/custom_folder',
  transformation: [
    { width: 300, height: 300, crop: 'fill' }
  ]
});

console.log(result.url); // Cloudinary URL
```

#### Delete a File:
```javascript
const { deleteFromCloudinary } = require('./utils/cloudinary');

await deleteFromCloudinary('campus_buddy/profile_pictures/image123', 'image');
```

---

## 📊 Cloudinary Dashboard

Access your Cloudinary dashboard at: https://cloudinary.com/console

### What You Can Do:
- View all uploaded files
- Monitor storage usage and bandwidth
- Create upload presets
- Set up transformations
- View analytics
- Manage folders and assets

---

## 🔧 Troubleshooting

### Issue: "Upload failed"
**Solution**: Check that environment variables are set correctly in `.env` files

### Issue: "Failed to upload to cloud storage"
**Solution**: Verify Cloudinary credentials and check internet connection

### Issue: Images not loading
**Solution**: Check browser console for CORS errors. Cloudinary URLs should work from any domain.

### Issue: PDF not viewable
**Solution**: Ensure the file was uploaded as `resource_type: 'raw'` for PDFs

---

## 📦 NPM Packages Installed

```bash
npm install cloudinary dotenv
```

- **cloudinary**: Official Cloudinary SDK for Node.js
- **dotenv**: Load environment variables from `.env` file

---

## 🎨 Image Transformations

Cloudinary automatically applies these transformations to profile pictures:
- **Resize**: 500x500px
- **Crop**: Fill with face detection
- **Quality**: Auto (optimal compression)
- **Format**: Auto (serves WebP to supported browsers)

You can customize transformations in the upload options:
```javascript
transformation: [
  { width: 500, height: 500, crop: 'fill', gravity: 'face' },
  { quality: 'auto', fetch_format: 'auto' }
]
```

---

## 📈 Benefits Over Local Storage

| Feature | Local Storage | Cloudinary |
|---------|--------------|------------|
| **Scalability** | Limited by disk space | Unlimited (pay-as-you-go) |
| **Performance** | Server bandwidth limited | Global CDN |
| **Backups** | Manual | Automatic |
| **Transformations** | Need custom code | Built-in API |
| **Security** | Manual implementation | Built-in features |
| **Cost** | Server costs | Free tier available |

---

## ✅ Testing Checklist

- [x] Backend Cloudinary utility created
- [x] Environment variables configured
- [x] Profile picture upload works
- [x] PDF resume upload works
- [x] Old files deleted when uploading new ones
- [x] Delete resume works
- [x] Frontend displays Cloudinary URLs correctly
- [x] No 404 errors for uploaded files

---

## 🔮 Future Enhancements

1. **Direct Frontend Uploads**
   - Use Cloudinary widget for drag-and-drop
   - Progress bars for large files
   - Multiple file uploads

2. **Advanced Transformations**
   - Generate PDF thumbnails
   - Create multiple image sizes
   - Add watermarks to resumes

3. **Analytics**
   - Track upload success rates
   - Monitor bandwidth usage
   - View popular file types

4. **Signed Uploads** (More Secure)
   - Generate upload signatures on backend
   - Prevent unauthorized uploads
   - Better control over upload parameters

---

## 📞 Support

For Cloudinary-specific issues, refer to:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)

---

**Last Updated**: November 20, 2025  
**Integration Status**: ✅ Complete and Functional
