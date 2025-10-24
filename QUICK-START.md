# 🚀 Vendor Portal - Quick Start Guide

## ✅ What's Been Done

✨ **Clean React-only codebase** - All UI5/CAPM code removed
✨ **BTP-ready architecture** - Approuter + MTA deployment setup
✨ **Local development proxy** - Works with localhost:4004 backend
✨ **Production routing** - Uses `vendorportaldest` destination in BTP

---

## 🏃 Local Development (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Your CAPM backend running on `localhost:4004`

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   cd approuter && npm install && cd ..
   ```

2. **Start your backend:**
   ```bash
   # In your backend project directory
   cds watch
   ```
   (Should run on http://localhost:4004)

3. **Start the React app:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:8080
   ```

That's it! The app proxies all API calls to your local backend.

---

## 🌐 BTP Deployment (15 minutes)

### Option A: MTA Build (Recommended)

1. **Install MBT tool:**
   ```bash
   npm install -g mbt
   ```

2. **Update `mta.yaml`:**
   - Set your backend URL in the `vendorportaldest-url` property
   - Or reference an existing service

3. **Build:**
   ```bash
   mbt build
   ```

4. **Deploy:**
   ```bash
   cf deploy mta_archives/vendor-portal-ui_1.0.0.mtar
   ```

### Option B: Direct CF Push

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Copy to approuter:**
   ```bash
   mkdir -p approuter/webapp
   cp -r dist/* approuter/webapp/
   ```

3. **Edit `manifest.yaml`:**
   - Update `YOUR_BACKEND_URL_HERE` with your actual backend URL
   - Update the route to match your BTP org/space

4. **Push to CF:**
   ```bash
   cd approuter
   cf push
   ```

---

## 🔧 BTP Destination Setup

### Create Destination in BTP Cockpit

1. Go to **Connectivity** > **Destinations**
2. Click **New Destination**
3. Use these settings:

```
Name: vendorportaldest
Type: HTTP
URL: https://your-backend-url.cfapps.region.hana.ondemand.com
ProxyType: Internet
Authentication: NoAuthentication (or configure as needed)
```

**Additional Properties:**
```
HTML5.DynamicDestination = true
HTML5.ForwardAuthToken = false
```

Or import `destination-config.json` after updating the URL.

---

## 📁 Project Structure

```
vendor-portal/
├── src/                        # React app source
│   ├── components/vendor/     # Vendor-specific components
│   ├── pages/                 # Route pages
│   ├── lib/                   # API client & utilities
│   └── types/                 # TypeScript types
├── approuter/                 # SAP Approuter
│   ├── xs-app.json           # Route configuration
│   └── package.json          # Approuter dependencies
├── mta.yaml                  # MTA deployment descriptor
├── manifest.yaml             # CF manifest (alternative)
├── vite.config.ts           # Vite + proxy config
└── README-DEPLOYMENT.md      # Detailed deployment guide
```

---

## 🎯 Key Features

✅ **Authentication**
- Login/Logout
- User registration with OTP
- Session management

✅ **Supplier Management**
- 5-step registration wizard
- File upload (max 2 files)
- GST validation
- AI text extraction

✅ **Approval Workflow**
- Multi-level approvers
- Email notifications
- Status tracking

✅ **Integration**
- SAP S/4HANA Business Partner API
- SAP BPA workflow trigger
- Gemini AI for document extraction

---

## 🛠️ Troubleshooting

### "Cannot connect to backend"
- ✓ Check backend is running on port 4004
- ✓ Check vite proxy config in `vite.config.ts`
- ✓ Restart dev server

### "Destination not found" (in BTP)
- ✓ Verify destination name is exactly `vendorportaldest`
- ✓ Check destination is in the correct subaccount
- ✓ Verify destination service is bound to app

### CORS errors
- ✓ In local: Backend should allow `http://localhost:8080`
- ✓ In BTP: Backend should allow approuter URL

---

## 📞 Next Steps

1. **Test locally** - Verify all features work with your backend
2. **Configure destination** - Set up `vendorportaldest` in BTP
3. **Deploy** - Use MTA or direct CF push
4. **Test in BTP** - Access via approuter URL

Need help? Check `README-DEPLOYMENT.md` for detailed instructions!
