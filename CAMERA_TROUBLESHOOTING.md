# Camera Troubleshooting Guide

## Common Camera Issues & Solutions

### Issue 1: "Camera permission denied"
**Cause:** Browser blocked camera access

**Solution:**
1. Look for camera icon in browser address bar (🎥 or 🚫)
2. Click it and select "Allow"
3. Refresh the page
4. Click "Open Camera" again

**Chrome/Edge:**
- Go to `chrome://settings/content/camera`
- Find your localhost site
- Set to "Allow"

**Firefox:**
- Click the lock icon in address bar
- Go to Permissions → Camera → Allow

### Issue 2: "No camera found"
**Cause:** No physical camera on device or camera is in use

**Solution:**
1. Check if your device has a camera (laptop webcam, phone camera)
2. Close other apps using the camera (Zoom, Teams, etc.)
3. Try using your phone instead of desktop
4. Restart the browser

### Issue 3: Camera not starting (no error shown)
**Cause:** HTTPS requirement

**Solution:**
The camera API requires either:
- ✅ `localhost` (should work)
- ✅ `127.0.0.1` (should work)
- ✅ HTTPS site
- ❌ HTTP on remote domain (won't work)

**Check your URL:**
- ✅ Good: `http://localhost:5173`
- ✅ Good: `http://127.0.0.1:5173`
- ❌ Bad: `http://192.168.x.x:5173` (needs HTTPS)

### Issue 4: Camera shows black screen
**Cause:** Wrong camera selected or driver issue

**Solution:**
1. Check if LED on camera is lit (indicates camera is on)
2. Test camera in another app (Windows Camera, Photo Booth)
3. Update camera drivers
4. Try different browser (Chrome works best)

### Issue 5: "getUserMedia is not defined"
**Cause:** Old browser version

**Solution:**
Update your browser to latest version:
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 12+

## Quick Test

### Test 1: Check Browser Support
Open browser console (F12) and run:
```javascript
console.log('getUserMedia supported:', 
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia))
```

Should show: `getUserMedia supported: true`

### Test 2: Manual Camera Test
In console, run:
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(() => console.log('✅ Camera works!'))
  .catch(err => console.error('❌ Camera error:', err))
```

### Test 3: Check Permissions
In console:
```javascript
navigator.permissions.query({ name: 'camera' })
  .then(result => console.log('Camera permission:', result.state))
```

States:
- `granted` ✅ - Will work
- `prompt` ⚠️ - Will ask for permission
- `denied` ❌ - Need to enable in settings

## For Hackathon Demo

### Option 1: Use Localhost (Recommended)
```bash
cd frontend
npm run dev
```
Access via: `http://localhost:5173`

### Option 2: Mobile Phone
1. Find your computer's local IP:
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```
2. Start dev server with host flag:
   ```bash
   npm run dev -- --host
   ```
3. Access from phone: `http://YOUR_IP:5173`
4. **Note:** May still need HTTPS for camera on mobile

### Option 3: Mock Camera (Fallback for Demo)
If camera still doesn't work, I can create a "simulated scan" mode where:
- Click "Scan Product" button
- Shows a product selector instead of camera
- Rest of the flow works the same
- Perfect for demo when camera fails

## What to Check Right Now

1. **Open the customer cart page**
2. **Click "Open Camera" button**
3. **Watch for:**
   - Permission popup from browser (Allow it)
   - Error message in the UI (red text)
   - Console errors (F12 → Console tab)

4. **Tell me:**
   - What error message do you see?
   - What's in the browser console?
   - Are you on localhost or remote IP?
   - What browser are you using?

## Emergency Demo Mode

If camera absolutely won't work for the demo, we can:
1. Add a "Manual Product Selection" fallback
2. Show pre-recorded camera demo video
3. Use screenshot overlay to simulate scanning

Let me know what error you're seeing and I'll fix it!
