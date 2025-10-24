# Vendor Portal - Deployment Guide

This React application works with your SAP BTP backend destination `vendorportaldest`.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start your CAPM backend locally** (on port 4004):
   ```bash
   # In your backend directory
   cds watch
   ```

3. **Start the React app:**
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:8080` and proxy API calls to your backend on port 4004.

## 📦 BTP Deployment Options

### Option 1: Using MTA (Recommended)

1. **Update mta.yaml with your backend URL:**
   - Edit `mta.yaml`
   - Update the `vendorportaldest-url` property with your actual backend URL

2. **Build the MTA archive:**
   ```bash
   mbt build
   ```

3. **Deploy to BTP:**
   ```bash
   cf deploy mta_archives/vendor-portal-ui_1.0.0.mtar
   ```

### Option 2: Direct CF Push

1. **Update manifest.yaml:**
   - Edit `manifest.yaml`
   - Replace `YOUR_BACKEND_URL_HERE` with your backend URL
   - Update the route according to your BTP region/org/space

2. **Build the React app:**
   ```bash
   npm run build
   ```

3. **Copy build to approuter:**
   ```bash
   mkdir -p approuter/webapp
   cp -r dist/* approuter/webapp/
   ```

4. **Deploy:**
   ```bash
   cf push
   ```

## 🔧 Configuration

### Backend Destination

The app uses the destination name `vendorportaldest`. Make sure this destination is configured in your BTP account:

**Destination Properties:**
- Name: `vendorportaldest`
- Type: `HTTP`
- URL: Your CAPM backend URL
- ProxyType: `Internet`
- Authentication: `NoAuthentication` (or configure as needed)

### Approuter Configuration

The approuter (`approuter/xs-app.json`) handles routing:
- Static files served from `/`
- Backend API calls proxied through `/odata`, `/uploadattachments`, etc.
- All routes configured to use the `vendorportaldest` destination

## 🔑 API Endpoints

The following endpoints are proxied to your backend:
- `/odata/v4/supplier/*` - Supplier service
- `/uploadattachments` - File uploads
- `/fileextraction` - Document text extraction
- `/fetchGSTDetails` - GST validation
- `/downloadZip/:supplierName/:username` - Download attachments as zip
- `/downloadFile/:fileID` - Download individual file

## 🎯 Features

- ✅ User Registration with OTP verification
- ✅ Login/Logout functionality
- ✅ Multi-step supplier creation wizard
- ✅ File upload with GST validation
- ✅ Approver management
- ✅ Supplier list and details
- ✅ Integration with SAP S/4HANA Business Partner API

## 🛠️ Troubleshooting

### CORS Issues
If you encounter CORS errors in production, ensure the backend allows requests from your approuter URL.

### Destination Not Found
1. Check if the destination `vendorportaldest` exists in your BTP cockpit
2. Verify the destination service is bound to your application
3. Check the destination name matches exactly (case-sensitive)

### Local Proxy Not Working
1. Verify your backend is running on port 4004
2. Check `vite.config.ts` proxy configuration
3. Try restarting the dev server

## 📝 Environment Variables

No `.env` files needed! The app uses:
- **Local:** Vite proxy to `localhost:4004`
- **Production:** Approuter routing to `vendorportaldest` destination

## 🏗️ Project Structure

```
vendor-portal/
├── src/                    # React source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── lib/               # API and utilities
│   └── types/             # TypeScript types
├── approuter/             # SAP Approuter
│   ├── package.json
│   └── xs-app.json        # Route configuration
├── dist/                  # Build output (generated)
├── mta.yaml              # MTA deployment descriptor
├── manifest.yaml         # CF manifest
└── vite.config.ts        # Vite configuration with proxy
```

## 🎨 Customization

To customize the app:
1. Update theme colors in `src/index.css`
2. Modify components in `src/components/`
3. Add new pages in `src/pages/`
4. Update routes in `src/App.tsx`

## 📞 Support

For issues:
1. Check console logs for errors
2. Verify backend connectivity
3. Review approuter logs: `cf logs vendor-portal --recent`
4. Check destination configuration in BTP cockpit
