# Railway Deployment Guide for BallisticWorks Market

## 1. Prepare Your Application for Railway

I've already updated the necessary files for Railway deployment:

### Files Updated:
- ✅ `package.json` - Added build and postinstall scripts
- ✅ `server/index.js` - Added static file serving for production
- ✅ `railway.json` - Railway configuration file
- ✅ `Dockerfile` - Custom Docker configuration for better compatibility
- ✅ `Procfile` - Process file for Railway
- ✅ Dual database system (PostgreSQL/SQLite)

## 2. Deploy to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your BallisticWorks repository
4. Railway will automatically detect it's a Node.js project

### Step 3: Add PostgreSQL Database (Recommended)
1. In your Railway project, click "New Service"
2. Select "PostgreSQL"
3. Railway will automatically create a DATABASE_URL

### Step 4: Configure Environment Variables
In your Railway project dashboard, go to Variables tab and add:

```env
NODE_ENV=production
STEAM_API_KEY=your_steam_api_key_here
SESSION_SECRET=your_very_secure_session_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_here
EMAIL_FROM=your_email@gmail.com
ADMIN_EMAIL=admin@ballisticworks.com
ADMIN_STEAM_ID=your_steam_id_here
```

**Important:** 
- Railway will automatically set `PORT`, `SERVER_URL`, `CLIENT_URL`, and `DATABASE_URL`
- The app will automatically use PostgreSQL if DATABASE_URL is present, otherwise SQLite

### Step 5: Deploy
1. Railway will automatically build and deploy your app
2. You'll get a URL like `https://your-app-name.railway.app`
3. The build process will:
   - Install server dependencies
   - Install client dependencies
   - Build the React app
   - Start the server

**If build fails:** Check the build logs in Railway dashboard and verify all environment variables are set.

## 3. Configure Steam OAuth

### Update Steam API Settings
1. Go to [Steam API Key Page](https://steamcommunity.com/dev/apikey)
2. Update your domain from `localhost` to your Railway URL
3. Update the return URL in your Steam application settings

### Update Environment Variables
Once deployed, update these in Railway:
- `SERVER_URL` - Your Railway app URL (e.g., `https://your-app.railway.app`)
- `CLIENT_URL` - Same as SERVER_URL for single-page deployment

## 4. Database Considerations

### SQLite (Current Setup)
- ✅ Works on Railway
- ✅ Simple setup
- ⚠️ Data persists only during deployment
- ⚠️ May be reset on redeployments

### Upgrade to PostgreSQL (Recommended for Production)
If you want persistent data:

1. **Add PostgreSQL to Railway:**
   - In your project, click "New Service"
   - Select "PostgreSQL"
   - Railway will provide connection details

2. **Update your application:**
   ```bash
   npm install pg
   ```

3. **Update database.js** to use PostgreSQL instead of SQLite

## 5. Email Configuration

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on Gmail
2. Generate an App Password:
   - Go to Google Account settings
   - Security > App passwords
   - Generate password for "Mail"
3. Use this app password in `EMAIL_PASS` variable

### Alternative Email Services
- **SendGrid:** Professional email service
- **Mailgun:** Reliable email API
- **SMTP2GO:** Simple SMTP service

## 6. File Upload Configuration

### Current Setup
- Uploads are stored in `/uploads` directory
- Works fine for Railway
- Files may be lost on redeployments

### Recommended: Use Cloud Storage
For production, consider:
- **AWS S3**
- **Cloudinary**
- **Railway's persistent volumes**

## 7. Custom Domain (Optional)

1. In Railway dashboard, go to Settings
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Steam OAuth settings with new domain

## 8. Monitoring and Logs

### Railway Dashboard
- View deployment logs
- Monitor app performance
- Check error logs
- View metrics

### Commands in Railway
```bash
# View logs
railway logs

# Connect to deployed app
railway shell

# Deploy manually
railway up
```

## 9. Security Checklist

### Before Going Live:
- ✅ Change SESSION_SECRET to a strong, unique value
- ✅ Use strong email passwords (app passwords)
- ✅ Set up proper CORS origins
- ✅ Review and secure admin access
- ✅ Enable HTTPS (Railway does this automatically)
- ✅ Test all functionality on the deployed URL

## 10. Testing Your Deployment

### After Deployment:
1. **Test Steam Login:**
   - Click "Login with Steam"
   - Verify redirection works
   - Complete profile setup

2. **Test Shopping:**
   - Add products via admin panel
   - Add items to cart
   - Complete checkout process

3. **Test Email Notifications:**
   - Place a test order
   - Verify email is received

4. **Test Admin Functions:**
   - Access admin panel
   - Add/remove products
   - Manage orders

## 11. Cost Considerations

### Railway Pricing:
- **Hobby Plan:** $5/month - Good for small communities
- **Pro Plan:** $20/month - Better for larger servers
- **Resources:** RAM, CPU, and bandwidth usage

### Optimization Tips:
- Use image compression for product photos
- Implement caching where possible
- Monitor resource usage

## 12. Troubleshooting

### Common Issues:

**Build Failures:**
- Check build logs in Railway dashboard
- Verify all dependencies are in package.json
- Ensure environment variables are set

**Steam Login Issues:**
- Verify Steam API key is correct
- Check return URL configuration
- Ensure domain is properly configured

**Database Issues:**
- Check file permissions
- Verify database path
- Consider upgrading to PostgreSQL

**Email Issues:**
- Verify SMTP settings
- Check Gmail app password
- Test email configuration

## 13. Maintenance

### Regular Tasks:
- Monitor error logs
- Update dependencies
- Backup database (if using SQLite)
- Review security settings
- Monitor performance metrics

### Updates:
- Push changes to GitHub
- Railway will auto-deploy
- Test after each deployment

## Need Help?

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- GitHub Issues: Create issues in your repository

Your BallisticWorks Market is now ready for Railway deployment! 🚀
