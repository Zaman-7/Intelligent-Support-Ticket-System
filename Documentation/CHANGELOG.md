# Changelog: Ticket Submission Fix (March 20, 2026)

## Overview
Fixed an issue where tickets failed to register when the "submit" button was clicked. The failure was caused by a silent row-locking error (MySQL Error 1442) on the server side during ticket creation.

## Files Modified
### 1. `backend/routes/tickets.js`
- **Change:** Added logic to insert the system welcome comment (`We have received your ticket...`) into the `Ticket_Updates` table immediately *after* the initial ticket creation is fully committed.
- **Reason:** The welcome comment used to be inserted via a MySQL trigger immediately when a record was inserted into the `Tickets` table. Moving it cleanly into the application layer avoids forcing MySQL to run multiple linked trigger operations inside the same exact query.

### 2. `backend/schema.sql`
- **Change:** Completely removed the definition block for the `AutoWelcomeComment` trigger.
- **Reason:** Ensuring the problematic trigger does not reappear if the `Intelligent_System` database is ever cleared and re-initialized from this SQL dump file. 

### 3. MySQL Database (`Intelligent_System` live instance)
- **Change:** Dropped the `AutoWelcomeComment` trigger directly (`DROP TRIGGER IF EXISTS AutoWelcomeComment;`).
- **Reason:** The live database was throwing the error because `Tickets` was locked during an `INSERT`. The `INSERT` triggered `AutoWelcomeComment`, which inserted into `Ticket_Updates`, which triggered `UpdateTicketTimestamp`, which then tried to `UPDATE Tickets` causing a cyclical table lock. Dropping the trigger manually in the live DB fixed the immediate backend crash without needing to rebuild their data setup.

# Changelog: UX Overhaul, Authentication & Gemini Triage (April 23, 2026)

## Overview
Implemented a massive UI/UX overhaul to introduce a welcoming "Support-Vibe", added secure password authentication using bcrypt and JWT, and integrated the Google Gemini API for automated ticket triage.

## Files Modified

### 1. `backend/package.json`
- **Change:** Added `@google/genai`, `bcrypt`, and `jsonwebtoken` to dependencies.
- **Reason:** Required for secure password hashing, JWT generation, and Gemini API integration.

### 2. `backend/routes/auth.js`
- **Change:** Replaced mock login/signup endpoints with real `bcrypt` password hashing and `jsonwebtoken` generation.
- **Specifics:**
  - `POST /login`: Compares hashed passwords, generates a 24h JWT.
  - `POST /signup`: Hashes passwords with salt, stores them in `password_hash`, generates a JWT.

### 3. `backend/routes/tickets.js`
- **Change:** Integrated Google Gemini API for automated triage on new ticket creation.
- **Specifics:**
  - `POST /`: Sends ticket subject and description to `gemini-2.5-flash` with a strict system prompt.
  - Parses JSON response for `suggested_priority`, `confidence_score`, `reasoning`, and `ai_draft_response`.
  - Wrapped ticket insertion and `Ai_Analysis` insertion inside a single MySQL transaction (`beginTransaction`, `commit`, `rollback`) so they succeed or fail together.
  - Modified the welcome comment to use the empathetic `ai_draft_response` provided by Gemini.

### 4. `frontend/src/index.css`
- **Change:** Transitioned from a dark, stark theme to a light, calming "Support-Vibe" palette.
- **Specifics:** Changed `--color-primary-base`, `--color-primary-surface`, `--color-primary-accent` to soft off-whites and blues. Updated `.glass-panel` to use lighter borders and shadow.

### 5. `frontend/src/App.jsx`
- **Change:** Updated Header component styles for the new light theme.
- **Specifics:** Adjusted text colors from white to slate, applied lighter background and borders.

### 6. `frontend/src/context/AuthContext.jsx`
- **Change:** Updated `login` and `signup` functions to accept and transmit `password` to the backend.

### 7. `frontend/src/pages/Login.jsx`
- **Change:** Completely overhauled the UI and added a password field.
- **Specifics:** Implemented soft gradients, friendly copy ("Welcome back", "Let's get started"), and integrated the `password` field into form state and submission. Added loading state (`Loader2`).

### 8. `frontend/src/pages/CustomerDashboard.jsx`
- **Change:** Overhauled UI for a welcoming support vibe and implemented feedback loops.
- **Specifics:** 
  - Replaced generic headings with friendly copy ("Hi there! How can we help you today?").
  - Changed status and priority badges to use gentle greens, ambers, and soft blues.
  - Added a highly visible `toast` notification system for success/error feedback on ticket submission.
  - Implemented loading states to disable the submit button while waiting for the Gemini API.

## Database SQL Commands Required
- **Required ALTER TABLE:** If the `Users` table column was previously named `password` (as shown in some schema definitions), it must be altered to `password_hash` to match the backend logic:
  \`\`\`sql
  ALTER TABLE Users CHANGE password password_hash VARCHAR(255) NOT NULL;
  \`\`\`

# Changelog: Feature Expansion & Accessibility (April 23, 2026)

## Overview
Fixed frontend accessibility issues by adjusting contrast on dashboards, implemented a centralized Login Portal to route users appropriately, added Global Profile Editing, and built Admin-level Agent Management functionality.

## Files Modified & Created

### 1. `frontend/src/pages/AgentDashboard.jsx` & `frontend/src/pages/AdminDashboard.jsx`
- **Change:** Fixed severe accessibility/contrast issues by applying a high-contrast light theme.
- **Specifics:** Updated background colors from `bg-white/5` or `bg-black/40` to solid `bg-white` and `bg-slate-50`. Changed text colors to `text-slate-800` and `text-slate-600` to ensure readability.

### 2. `frontend/src/pages/LoginPortal.jsx` (NEW)
- **Change:** Created a Central Login Portal directory at the `/login` route.
- **Specifics:** Provides clear visual cards for "Customer Portal" (routes to `/login/customer`) and "Staff Portal" (routes to `/login/staff`).

### 3. `frontend/src/pages/Login.jsx` & `frontend/src/App.jsx`
- **Change:** Refactored login logic to support distinct staff/customer flows.
- **Specifics:** `Login.jsx` now accepts an `isStaff` prop. If `true`, the sign-up functionality is hidden. Updated `App.jsx` router to map `/login` to `LoginPortal`, and `/login/customer` / `/login/staff` to the respective parameterized `Login` components. Added `Profile` link to Header.

### 4. `frontend/src/pages/Profile.jsx` (NEW)
- **Change:** Added a global profile editing UI accessible from the navigation bar.
- **Specifics:** Allows users to view and update their username, email, and password.

### 5. `backend/routes/users.js` (NEW)
- **Change:** Implemented new protected routes for profile updates and agent management.
- **Specifics:**
  - `PUT /api/users/profile`: Protected via JWT. Allows updating user details. Hashes new password via `bcrypt` if provided.
  - `POST /api/users/agents`: Protected via JWT and an Admin-only role check middleware. Accepts `username`, `email`, and `password`, hashes the temporary password, and inserts the user with the 'Agent' role.
- **Note:** Mounted this new route file in `backend/server.js`.

### 6. `backend/server.js`
- **Change:** Mounted the new users router (`app.use('/api/users', require('./routes/users'));`).

## Database SQL Commands Required
- **Required ALTER TABLE:** No new structural alterations were required for these changes since `password_hash` and `role` columns were already established. The updates successfully leverage the existing schema.
