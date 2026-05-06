# Veritas | Minimalist Finance Terminal

Veritas is a high-performance, minimalist budgeting application designed for users who value speed, data sovereignty, and clarity. It allows you to track expenses, manage dynamic budget categories, and automate recurring payments with a brutalist, typography-driven interface.

## 🚀 Features

- **Dual-State Persistence**: Work offline with Local Storage and sync instantly to the cloud when signing in.
- **Dynamic Budgeting**: Create and edit categories with custom limits, colors, and icons.
- **Automated Recurring Expenses**: Set up monthly, weekly, or daily automations that execute on launch.
- **Data Integrity**: Powered by strict Firestore Security Rules to ensure your financial data remains private and secure.
- **Visual Allocation**: Real-time distribution charts showing "Essential" vs "Lifestyle" spending.
- **Relational Resilience**: Deleting a category automatically safeguards orphaned expenses by moving them to "Others".

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Motion (formerly Framer Motion)
- **Database/Auth**: Firebase (Firestore & Google OAuth)
- **Analytics**: Recharts
- **Icons**: Lucide React

## 📱 Mobile Setup

Veritas is built as a mobile-first web application. To get it running on your phone:

1. **Access the App**: Open your mobile browser (Safari on iOS, Chrome on Android) and navigate to the **Shared App URL** provided in AI Studio.
2. **Sign In**: Use Google Login to sync your data across devices.
3. **Add to Home Screen**:
   - **iOS**: Tap the **Share** button (box with arrow) and select **"Add to Home Screen"**.
   - **Android**: Tap the **three dots** (menu) and select **"Install App"** or **"Add to Home Screen"**.
4. **App Mode**: Once added, the app will open in fullscreen mode, behaving like a native application with a dedicated icon.

## 🔒 Security

All transactions are protected by Attribute-Based Access Control (ABAC). Security rules enforce:
- **Identity Isolation**: Users can only access documents under their own `users/{uid}` path.
- **Schema Validation**: Every write is validated against strict types and size limits to prevent data corruption or "Denial of Wallet" attacks.
- **Immortal Fields**: Created dates and owner IDs are immutable once committed.
