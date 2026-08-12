# Customer AI Assistant - Troubleshooting Guide

## ✅ Changes Made

### 1. Component Position Fixed
- Changed from `fixed` to `absolute` positioning
- Fixed button is now relative to Cart container (not viewport)
- Added `position: relative` to Cart component root div

### 2. Enhanced Visibility
- **Button Size**: 56×56px (w-14 h-14)
- **Position**: Bottom: 100px, Left: 24px
- **Z-index**: 999 (very high to appear above everything)
- **Visual Enhancement**:
  - White 3px border
  - Strong green glow shadow
  - Extra large (text-2xl) emoji

### 3. Debug Console Log
- Component logs "✅ CustomerAI component mounted!" when it loads
- Check browser console (F12) to verify it's rendering

## 🔍 How to Test

### Step 1: Start the App
```bash
cd frontend
npm run dev
```

### Step 2: Navigate to Customer Cart
1. Open http://localhost:5174 (or whatever port Vite shows)
2. Click the CartAI app icon on the home screen
3. Choose "Customer Login"
4. Enter any mobile number (e.g., 9876543210)
5. Click "Continue"

### Step 3: Look for the AI Button
You should see a **bright green round button** with a 🤖 robot emoji:
- **Location**: Bottom-left area of the screen
- **Appearance**: Green gradient with white border and glow effect
- **Position**: About 100px from bottom, 24px from left

### Step 4: Check Browser Console
Press `F12` to open DevTools, go to Console tab:
- Look for: `✅ CustomerAI component mounted!`
- If you see this, the component is rendering

## 🐛 If Still Not Visible

### Issue 1: Component Not Mounting
**Check:**
```bash
# Verify CustomerAI.jsx exists
ls -la frontend/src/components/CustomerAI/

# Verify import in Cart.jsx
grep "CustomerAI" frontend/src/components/Cart/Cart.jsx
```

**Should see:**
- Import line: `import CustomerAI from '../CustomerAI/CustomerAI'`
- Usage line: `<CustomerAI cartItems={cartItems} />`

### Issue 2: CSS/Overflow Clipping
The MobileFrame component has `overflow: hidden` which was causing issues.

**Current fix:**
- Button uses `absolute` positioning
- Cart container has `position: relative`
- Button positioned within visible area

### Issue 3: Z-index Stacking
**Current z-index values:**
- Checkout overlay: z-50
- Recommendation banner: default
- **CustomerAI button: z-999** (highest)

### Issue 4: Button Outside Viewport
**Current positioning:**
- `bottom: 100px` - well above the cart summary
- `left: 24px` - visible left side
- Button is 56×56px - large enough to see

## 🎨 Visual Specifications

### Button (Closed State)
```css
width: 56px
height: 56px
bottom: 100px
left: 24px
z-index: 999
background: linear-gradient(135deg, #34c759, #30d158)
border: 3px solid white
box-shadow: 
  0 8px 32px rgba(52, 199, 89, 0.5),
  0 0 0 4px rgba(52, 199, 89, 0.1)
```

### Chat Window (Open State)
```css
width: 320px
height: 460px
bottom: 100px
left: 24px
z-index: 999
background: white
```

## 📸 Expected Result

When you're on the customer cart page, you should see:
1. **Top**: Header with mobile number and Sign Out button
2. **Middle**: 
   - Offers strip (horizontal scroll)
   - Camera/scan area (large card)
3. **Bottom**: 
   - Cart summary with items and checkout button
   - **🤖 Green AI button** (bottom-left, slightly floating above cart)

## 🔧 Quick Fixes

### Force Refresh
```bash
# Clear Vite cache and rebuild
cd frontend
rm -rf node_modules/.vite
npm run build
npm run dev
```

### Hard Refresh Browser
- Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` or `Cmd + Shift + R`

### Check React DevTools
1. Install React Developer Tools browser extension
2. Open DevTools → React tab
3. Navigate to `Cart` component
4. Look for `CustomerAI` as a child
5. Check if `open` state is `false` (button should show)

## 💡 Test Interaction

Once the button is visible:
1. **Click the 🤖 button** → Chat window opens
2. **Quick action chips** appear below welcome message
3. **Click a chip** (e.g., "What should I buy with chips?")
4. **AI responds** with product recommendations
5. **Type your own question** in the input box
6. **Click ✕** in header to close chat

## 🚨 Common Mistakes

❌ Looking on the **shopkeeper dashboard** (wrong page!)
   → AI assistant is only on **customer cart page**

❌ Button hidden behind other elements
   → Fixed with z-index: 999

❌ Button clipped by mobile frame
   → Fixed with absolute positioning

❌ Old build cached in browser
   → Do hard refresh (Ctrl+Shift+R)

## 📝 Files Modified

1. `/frontend/src/components/CustomerAI/CustomerAI.jsx` - New component
2. `/frontend/src/components/Cart/Cart.jsx` - Added import and usage
3. Already had `@google/generative-ai` installed (no package.json change needed)

---

**If you still don't see it after following all steps, please:**
1. Take a screenshot of the customer cart page
2. Share the browser console output (F12 → Console tab)
3. Check if "✅ CustomerAI component mounted!" appears in console
