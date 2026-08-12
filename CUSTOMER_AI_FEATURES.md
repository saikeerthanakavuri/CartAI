# Customer AI Assistant - Feature Documentation

## Overview
Added an AI-powered shopping assistant chatbot for customers to help with product discovery, recommendations, and shopping guidance.

## Location
- **Component**: `frontend/src/components/CustomerAI/CustomerAI.jsx`
- **Integrated in**: Cart page (customer view)
- **Position**: Bottom-left floating button (🤖 icon)

## Features

### 1. **Floating Chat Button**
- Green gradient button with 🤖 emoji
- Appears on the bottom-left corner of the cart page
- Clicking opens the chat interface

### 2. **AI Shopping Assistant**
- Powered by Google Gemini AI
- Context-aware of:
  - All products in the store catalog
  - Customer's current cart items
  - Available combo deals and offers
  - Product prices and categories

### 3. **Quick Action Buttons**
Pre-defined questions customers can tap to start:
- "What should I buy with chips?"
- "What's cheapest?"
- "Suggest a breakfast combo"
- "What's in my cart?"

### 4. **Capabilities**
The AI assistant can:
- **Product Discovery**: Help find specific items
- **Recommendations**: Suggest products based on what's in cart
- **Combo Suggestions**: Recommend product pairings (e.g., chips + cola)
- **Price Queries**: Answer questions about pricing
- **Cart Summary**: Tell customers what's in their cart
- **Alternative Suggestions**: Suggest similar products if something isn't available

## Example Conversations

### Product Recommendations
```
Customer: "What should I buy with chips?"
AI: "Great choice! 🥤 I'd recommend pairing your chips with:
- Coca-Cola (₹40) - Our most popular combo, save ₹10!
- Frooti (₹15) - A refreshing mango drink
Would you like me to suggest more?"
```

### Cart Inquiry
```
Customer: "What's in my cart?"
AI: "You currently have:
- Lays Classic × 2 = ₹40
- Coca-Cola × 1 = ₹40
Total: ₹80 (2 items)

That's a classic combo! 🎉"
```

### Budget Shopping
```
Customer: "What's cheapest?"
AI: "Looking for budget-friendly options? Here are our most affordable items:
- Hajmola (₹10) - Digestive candy
- Maggi Noodles (₹15) - Quick meal
- Frooti (₹15) - Mango drink
All great value for money! 💰"
```

## Design Details

### Color Scheme
- **Primary**: Green gradient (#34c759 to #30d158)
- **User messages**: Green background, white text
- **AI messages**: Light gray background, black text

### UI Elements
- **Chat bubble**: 56×56px, bottom-left fixed
- **Chat window**: 340×520px with rounded corners
- **Header**: Green gradient with assistant info
- **Messages**: iOS-style bubbles with smooth animations
- **Input**: Light gray with send button

## Technical Details

### Dependencies
- `@google/generative-ai` - Gemini AI integration
- `framer-motion` - Smooth animations (already in use)
- React hooks: `useState`, `useRef`, `useEffect`

### Props
```jsx
<CustomerAI cartItems={cartItems} />
```
- `cartItems`: Array of current cart items for context-aware responses

### State Management
- `messages`: Chat history (role + text)
- `input`: Current user input
- `loading`: AI response loading state
- `open`: Chat window visibility

## Benefits for the Hackathon Demo

1. **Interactive Experience**: Customers can ask questions naturally
2. **Personalized**: AI knows what's in their cart and suggests accordingly
3. **Sales Enablement**: Encourages discovery of complementary products
4. **Modern UX**: Clean, iOS-style chat interface
5. **AI Showcase**: Demonstrates practical AI integration beyond just scanning

## Usage in Demo

When demoing to judges:
1. Show customer scanning a product (e.g., Lays)
2. Click the AI assistant button
3. Ask: "What goes well with this?"
4. AI suggests Coca-Cola with the current offer
5. Show how it's aware of the cart contents
6. Demonstrate quick action buttons for ease of use

This creates a complete "smart shopping" experience loop:
**Scan Product → AI Recommends → Add to Cart → Checkout**

---

**Note**: The AI assistant appears only on the customer cart page, complementing the shopkeeper's business AI copilot in the dashboard.
