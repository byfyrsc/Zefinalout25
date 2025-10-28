# 🤖 AI Development Rules for InteliFeed Hub

This document outlines the core technologies and best practices for developing the InteliFeed Hub application. Adhering to these rules ensures consistency, maintainability, and optimal performance.

## 🚀 Tech Stack Overview

The InteliFeed Hub is built on a modern, robust, and mobile-first stack:

*   **Frontend Framework:** React 18+ with TypeScript and Vite for a fast development experience.
*   **UI Components:** Shadcn/ui and Radix UI for accessible and customizable components.
*   **Styling:** Tailwind CSS for utility-first styling, ensuring responsive and consistent design.
*   **State Management:** React Query for server-state management (data fetching, caching, synchronization) and Zustand for client-side UI state.
*   **Routing:** React Router for declarative navigation within the application.
*   **Animations:** Framer Motion for fluid and engaging micro-interactions and transitions.
*   **Mobile & PWA:** Capacitor.js for native device capabilities (camera, haptics, geolocation, push notifications) and Vite PWA Plugin with Workbox for Progressive Web App features (offline support, installability).
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions) for a scalable and secure backend.
*   **Charting:** Recharts for powerful and customizable data visualization.
*   **Form Handling:** React Hook Form with Zod for efficient form management and validation.
*   **Notifications:** Sonner for elegant toast notifications and Shadcn/ui's `useToast` for imperative UI toasts.

## 📚 Library Usage Guidelines

To maintain consistency and leverage the strengths of each library, please follow these guidelines:

*   **UI Components:**
    *   **Shadcn/ui & Radix UI:** Always prioritize components from `shadcn/ui` (which are built on Radix UI). If a specific component is not available in `shadcn/ui`, you may use a Radix UI primitive directly, but ensure it aligns with the project's design system.
*   **Styling:**
    *   **Tailwind CSS:** Exclusively use Tailwind CSS utility classes for all styling. Avoid custom CSS files or inline styles unless absolutely necessary for dynamic, calculated values.
*   **Icons:**
    *   **Lucide-react:** Use icons from the `lucide-react` library for all visual iconography.
*   **State Management:**
    *   **React Query:** Use `@tanstack/react-query` for all asynchronous data fetching, caching, and synchronization with the backend.
    *   **Zustand:** Use `zustand` for global client-side UI state that doesn't involve server interaction (e.g., sidebar open/close, dark mode toggle).
*   **Routing:**
    *   **React Router:** Use `react-router-dom` for all application navigation. Keep main routes defined in `src/App.tsx` and `src/routes/protectedRoutes.tsx` / `src/routes/publicRoutes.tsx`.
*   **Animations:**
    *   **Framer Motion:** Use `framer-motion` for complex animations, page transitions, and interactive elements. For simple transitions, Tailwind's built-in `transition` utilities are sufficient.
*   **Date Handling:**
    *   **date-fns:** Use `date-fns` for all date manipulation, formatting, and comparisons.
*   **Form Handling & Validation:**
    *   **React Hook Form & Zod:** Use `react-hook-form` for managing form state and submissions, and `zod` for schema-based form validation.
*   **Toasts & Notifications:**
    *   **Sonner:** For general, non-blocking notifications (e.g., "Item saved successfully"), use `sonner`.
    *   **Shadcn/ui Toast:** For more interactive or critical UI-blocking notifications (e.g., "Undo" action, "Error occurred"), use the `useToast` hook from `shadcn/ui/use-toast`.
*   **Virtualization:**
    *   **@tanstack/react-virtual:** Use for rendering large lists to optimize performance.
*   **Intersection Observer:**
    *   **react-intersection-observer:** Use for lazy loading components or images when they enter the viewport.
*   **PWA & Offline:**
    *   **Capacitor.js:** For accessing native device features (camera, haptics, geolocation, push notifications).
    *   **Vite PWA Plugin & Workbox:** For managing service workers, caching strategies, and PWA manifest.
*   **QR Code Generation:**
    *   **qrcode:** Use the `qrcode` library for generating QR codes.
*   **Charts:**
    *   **Recharts:** Use `recharts` for all data visualization charts.
*   **Backend Interaction:**
    *   **@supabase/supabase-js:** Use the Supabase client for all interactions with your Supabase backend (Auth, Database, Storage).
*   **Payments:**
    *   **@stripe/stripe-js:** Use for client-side Stripe integration.
    *   **stripe (Node.js library):** Use for server-side Stripe operations (e.g., in Supabase Edge Functions).
*   **Utility Functions:**
    *   **clsx & tailwind-merge:** Use these in conjunction to create the `cn` utility function for conditionally combining Tailwind classes.