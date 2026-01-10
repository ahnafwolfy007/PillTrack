# PillTrack - Medication Reminder & Online Marketplace

PillTrack is a comprehensive healthcare application designed to streamline medication management and procurement. It features a modern "antigravity" aesthetic with smooth interactions and a focus on user experience.

## Features

-   **Smart Reminders**: Intelligent medication tracking and adherence monitoring.
-   **Marketplace**: Verified online pharmacy with search, categories, and shopping cart.
-   **Dashboard**: Patient-centric view with daily schedules, low stock alerts, and health stats.
-   **Authentication**: Secure login and registration with multi-role support (Patient, Shop Owner, Admin).
-   **Medication Management**: Inventory tracking, dosage scheduling, and refill reminders.
-   **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

## Tech Stack

-   **Frontend**: React.js (Vite)
-   **Styling**: TailwindCSS
-   **Animations**: Framer Motion
-   **Component Library**: Custom Shadcn-inspired UI components
-   **Icons**: Lucide React
-   **Data Visualization**: Recharts
-   **Routing**: React Router DOM

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

-   `src/components/ui`: Reusable UI primitives (Button, Card, Input, Tabs).
-   `src/components/dashboard`: Dashboard specific components (Sidebar, Navbar, Layout).
-   `src/pages`: Main route components.
    -   `Landing`: Public landing page.
    -   `Auth`: Authentication handling.
    -   `Dashboard`: Protected user area.
    -   `Marketplace`: Medicine shop interface.
-   `src/utils`: Utility functions.

## Design Philosophy

The application follows a clean, medical-grade aesthetic with:
-   **Primary Color**: Medical Blue Gradient (`#3B82F6` to `#1E40AF`)
-   **Secondary**: Healing Green
-   **Font**: Inter (Clean framer-style typography)
-   **Glassmorphism**: Subtle transparencies and blurs for depth.

## License

Private / Proprietary.
