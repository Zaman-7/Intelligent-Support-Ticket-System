# Intelligent Support Ticket System

## Project Overview

This project implements a full-stack **Customer Support System (IntelliDesk)** built as a Database Management System (DBMS) mini-project. It features a modern, responsive frontend built with React and Tailwind CSS v4, connected to a Node.js/Express backend that securely interfaces with a normalized MySQL database.

The application allows two distinct roles:
1.  **Customers**: Can log in, file new support requests categorizing their problems, and monitor the timeline/resolution status of their submitted tickets.
2.  **Agents/Admins**: Can log in to an active queue dashboard to observe, prioritize, and respond to incoming requests. They can view mock "AI Prediction" attributes denoting the confidence of a system-generated category inference, and submit comments including private "Internal Notes" only visible to other agents.

---

## Architecture & Technology Stack

*   **Frontend**: React.js (Bootstrapped via Vite CLI), styled iteratively using standard Vanilla CSS first, then migrated entirely to **Tailwind CSS v4** utilizing an integrated `@tailwindcss/vite` plugin for a modern UI.
*   **Routing**: `react-router-dom` for component-level client routing.
*   **Icons**: `lucide-react`.
*   **Backend**: Node.js utilizing `express` framework.
*   **API Client**: `axios` for standard HTTP routing between React forms and Express servers.
*   **Database**: MySQL initialized heavily leveraging `mysql2/promise` natively connecting utilizing a connection pool.
*   **Environment Variables**: `dotenv` securely feeding MySQL auth constants to prevent leakage.

---

## Database Design & Schema Refactoring

The system is centered around five core tables normalized to handle scalable support scenarios:

1.  **`Users`**: Holds credentials and establishes Identity. Differentiates permissions via an `ENUM('Customer', 'Agent', 'Admin')` definition.
2.  **`Categories`**: Central metadata definitions restricting input fields allowing clean foreign constraints on Tickets.
3.  **`Tickets`**: The central operational entity bound heavily by dual Foreign Keys mapping directly to `Users(user_id)` and `Categories(categories_id)`. Tracks current `status` and `priority`.
4.  **`ticket_update`**: Holds the discussion thread. Employs an `is_internal` boolean flag to cleanly segregate public customer replies and internal agent notes bound cleanly securely to an independent ticket logic loop.
5.  **`AI_Predictions`**: External metadata housing data science inference values (`confidence_score`) and output rationale (`feedback`).

> *Development Note:* A critical foreign key mismatch occurred (`ERROR 3780`) during initial scaffolding because legacy generated constraints mapped `INT` to `INT UNSIGNED`. A full structural schema cleanup mapped all identical auto-increment columns to standard `INT` configurations ensuring relational integrity cascaded correctly via `schema.sql`.

---

## Actions Performed & Implementation Log

### Phase 1: Frontend Aesthetic Foundations & Vite Scaffolding
*   **Executed Commands:** Used `npx -y create-vite@latest ./ --template react` in the root working directory to build a React scaffold without prompting. Installed frontend routing dependencies `npm install lucide-react react-router-dom`.
*   **Created Files (`frontend/src`):**
    *   `index.css`: Engineered a detailed color variable theme built with Vanilla CSS outlining specific glassmorphism visual aesthetics bounding hex colors against database `status` enums (e.g. `--priority-urgent: #ef4444`).
    *   `App.jsx`: Defined the highest layout layer instantiating a common `Sidebar` component routing dynamically.
    *   `pages/Dashboard.jsx` & `pages/TicketDetail.jsx`: Hard-coded mock data simulating the data schemas visually testing visual fidelity, card aesthetics, and table rows before connecting databases.

### Phase 2: Express Server & Backend Connectivity setup
*   **Executed Commands:** `mkdir -p backend/config backend/routes backend/controllers && cd backend && npm init -y && npm install express mysql2 cors dotenv`. 
*   **Created Files (`backend/`):**
    *   `server.js`: Initiated a basic Express web daemon routing three major domains: `/api/auth`, `/api/tickets`, and `/api/categories`. Modulated default port configuration from `5000` to `5001` preventing catastrophic network clashes occurring on MacOS (`Airplay Receiver` inherently locking up Port 5000 natively).
    *   `config/db.js`: Implemented the async native `mysql2` connectivity pool passing `.env` variables securely.
    *   `schema.sql`: Programmatically replicated the provided SQL tables formatting foreign keys directly mapped locally. Created dummy insert routines for rapid demo testing securely overriding mismatch errors via `DROP DATABASE IF EXISTS`.
    *   **Controllers (`routes/`):**
        *   `auth.js`: Implemented a query binding endpoint routing simple `SELECT * FROM Users where email = ?` authentications bypassing JWT strict handling mapping role strings instantly.
        *   `categories.js`: Raw query dumping mapping category names dynamically populating the UI creation form. 
        *   `tickets.js`: The heavy-lifting script. Encapsulates advanced `JOIN` clauses grabbing Ticket structures coupled immediately inside `Users` mappings mapping name schemas simultaneously exposing dynamic AI datasets asynchronously linked against individual ticket identifiers. Contains direct logic for mutating `INSERT INTO ticket_update`.

### Phase 3: Tailwind CSS v4 Migration & Interactive UI Delivery
*   **Executed Commands:** Removed Vanilla CSS constructs and enforced direct `var` level compilation inside Vite. Installed tailwind mapping: `npm install tailwindcss @tailwindcss/vite axios --legacy-peer-deps`.
*   **Created/Modified Files (`frontend/src`):**
    *   `vite.config.js`: Integrated the new `@tailwindcss/vite` plugin enforcing native JIT compile behaviors.
    *   `index.css`: Wiped previous strict CSS formatting and replaced completely with modern `@theme` root variables bounding variables into native tailwind functions globally applying `glass-panel` utilities recursively.
    *   `context/AuthContext.jsx`: Constructed a top level state memory layer utilizing native React contexts caching the API's token behaviors into `localStorage` dynamically restricting views. 
    *   `api.js`: Deployed Axios wrapper routing strictly against `http://localhost:5001/api`.
    *   *Refactored UI Routes (Styling via Tailwind classes natively mapping backend queries)*:
        1.  `pages/Login.jsx`: Built authentication portal visually testing users against DB matching specific role behaviors mapping `agent@example.com` or `customer@example.com`.
        2.  `pages/CustomerDashboard.jsx`: Displays the 'My Tickets' API fetch table mapped directly routing visually styled status constraints and form fields explicitly `onSubmit` emitting HTTP posts into `/api/tickets/`.
        3.  `pages/AgentDashboard.jsx`: Deployed analytics view capturing metric counters dynamically polling `tickets.filter(t => t.priority === 'Critical')` lengths natively displaying visual "Kanban" styles on Open tickets.
        4.  `App.jsx`: Wrapped global view utilizing strict semantic UI protections deploying `<ProtectedRoute>` wrappers globally.

### Phase 4: Fixing Local Execution Issues
*   Corrected the `api.js` local network routing to correctly poll the updated `PORT 5001`.
*   Altered local MySQL configurations automatically pushing the explicit user-provided password `Aleem007` to override standard `ER_ACCESS_DENIED_ERROR` occurrences when compiling schema changes into root terminal processes cleanly restarting schemas.
