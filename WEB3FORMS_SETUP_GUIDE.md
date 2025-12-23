# 📧 Web3Forms Email Service Setup Guide

## What is Web3Forms?

Web3Forms is a free email service that allows you to send emails from your backend without requiring SMTP configuration. It's perfect for contact forms, notifications, and automated emails.

## 🔑 Step 1: Get Your Web3Forms Access Key

1. **Visit Web3Forms**: Go to [https://web3forms.com](https://web3forms.com)
2. **Sign Up/Login**: Create a free account or login
3. **Get Access Key**: 
   - Go to your dashboard
   - Copy your unique access key
   - It looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

## 📝 Step 2: Add to Environment Variables

1. **Open/Create `.env` file** in the `backend` directory:
   ```bash
   cd backend
   ```

2. **Add your Web3Forms key**:
   ```env
   WEB3FORMS_KEY=your-access-key-here
   ```

   Example:
   ```env
   WEB3FORMS_KEY=a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```

3. **Complete `.env` file should look like**:
   ```env
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campus-placement?retryWrites=true&w=majority
   
   # Server
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   
   # Web3Forms Email Service
   WEB3FORMS_KEY=your-web3forms-access-key-here
   ```

## ✅ Step 3: Configure Email Recipient

1. **Go to Web3Forms Dashboard**: [https://web3forms.com/dashboard](https://web3forms.com/dashboard)
2. **Set Default Email**: 
   - Configure the email address where you want to receive emails
   - This is the email that will receive all notifications sent through Web3Forms

## 🧪 Step 4: Test the Email Service

Run the test script to verify everything is working:

```bash
cd backend
node test-web3forms.js
```

You should see:
- ✅ WEB3FORMS_KEY is set
- ✅ Email sent successfully!

## 📧 How It Works

The email service is used to send notifications when:
- Application status changes (approved, rejected, interview scheduled, etc.)
- Students receive updates about their applications
- Mentors/Admins update application statuses

### Email Flow:
1. Admin/Mentor updates application status
2. System fetches student and internship details
3. Email notification is sent via Web3Forms
4. Student receives email at their registered email address

## 🔍 Troubleshooting

### Issue: "WEB3FORMS_KEY missing"
**Solution**: Make sure you've added `WEB3FORMS_KEY` to your `.env` file in the `backend` directory.

### Issue: Emails not being received
**Solutions**:
1. Check your spam/junk folder
2. Verify the email is configured correctly in Web3Forms dashboard
3. Check Web3Forms dashboard for delivery status
4. Verify your access key is correct

### Issue: "Email send failed"
**Solutions**:
1. Check your internet connection
2. Verify your Web3Forms access key is valid
3. Check Web3Forms service status
4. Review server logs for detailed error messages

## 📊 Free Tier Limits

Web3Forms free tier includes:
- ✅ 250 emails per month
- ✅ No credit card required
- ✅ Basic email templates

For higher limits, consider upgrading to a paid plan.

## 🔗 Useful Links

- **Web3Forms Website**: [https://web3forms.com](https://web3forms.com)
- **Documentation**: [https://docs.web3forms.com](https://docs.web3forms.com)
- **Dashboard**: [https://web3forms.com/dashboard](https://web3forms.com/dashboard)

---

**Note**: Never commit your `.env` file to git. It's already in `.gitignore` for security.

