# Changelog: Admin God View & Ticket Detail Light Theme (April 23, 2026)

## Overview
Implemented a "Global Archive" tab in the Admin Dashboard to fetch and display all tickets, backed by a new admin route. Additionally, completed the final phase of the light theme overhaul by stripping out all legacy dark-mode classes in `TicketDetail.jsx`.

## Files Modified

### 1. `frontend/src/pages/TicketDetail.jsx`
- **Change:** Complete Light Theme CSS Overhaul.
- **Specifics:**
  - Removed all dark-mode styles (`bg-black/40`, `text-white`, `border-white/10`, `text-slate-300`).
  - Updated the main description box to `bg-slate-50 border-slate-200 text-slate-800`.
  - Updated Activity Log chat bubbles:
    - User messages changed to `bg-blue-600 text-white`.
    - System/Agent messages changed to `bg-slate-100 border-slate-200 text-slate-800`.
  - Updated AI Agent Copilot section:
    - Removed black backgrounds (`bg-black/30`, `bg-black/40`).
    - Applied soft, legible colors: `bg-pink-50 border-pink-100 text-pink-900` for text and `bg-pink-100` for progress bars.
  - Updated the reply textarea to use `text-slate-800` and updated the placeholder to be readable (`placeholder-slate-400` / `placeholder-amber-400`).

### 2. `frontend/src/pages/AdminDashboard.jsx`
- **Change:** Added "Global Archive" God View Tab.
- **Specifics:**
  - Added a 5th tab to the navigation buttons using the `Archive` icon.
  - Updated `fetchData()` function to call `/admin/tickets/all` when `activeTab === 'archive'`.
  - Stored the fetched data in a new `allTickets` state.
  - Rendered a new table for the archive displaying: Ticket ID, Subject, Customer Name, Assigned Agent, Status, and Priority.
  - Made the table rows clickable to navigate directly to `/ticket/:ticket_id`.

### 3. `backend/routes/admin.js`
- **Change:** Added backend route for Global Archive.
- **Specifics:**
  - Created `GET /tickets/all` endpoint.
  - Executes a SQL query to `SELECT` every ticket, `JOIN` the Categories table for category names, `JOIN` the Users table for the customer's username, and `LEFT JOIN` the Users table for the assigned agent's username.
  - Ordered the query results by `created_at DESC`.

# Changelog: SLA Extension Approval Workflow (April 23, 2026)

## Database SQL Commands Required
To support the SLA Extension Approval Workflow, the `Tickets` table must be altered to track extension requests.
- **Required ALTER TABLE:**
  ```sql
  ALTER TABLE Tickets ADD COLUMN sla_extension_status ENUM('None', 'Requested', 'Approved', 'Denied') DEFAULT 'None';
  ```

## Backend Route Updates

### 1. `backend/routes/tickets.js`
- **Change:** Ensure new tickets are inserted with `sla_extension_status` set to `'None'` by default.
- **Change:** Added Agent route to request an extension.
- **Specifics:** `PUT /api/tickets/:ticketId/request-sla` sets `sla_extension_status = 'Requested'`.

### 2. `backend/routes/admin.js`
- **Change:** Added Admin routes for approving and denying SLA extension requests.
- **Specifics:**
  - `PUT /api/admin/tickets/:ticketId/approve-sla`: Adds 24 hours to `sla_due_date` using `DATE_ADD(sla_due_date, INTERVAL 24 HOUR)` and sets `sla_extension_status = 'Approved'`.
  - `PUT /api/admin/tickets/:ticketId/deny-sla`: Sets `sla_extension_status = 'Denied'`.

## Frontend UI Updates

### 1. `frontend/src/pages/TicketDetail.jsx`
- **Change:** Integrated Agent UI for requesting SLA extensions within the "Quick Actions" panel.
- **Specifics:**
  - Displays a "Request SLA Extension" button for Agents/Admins if the `sla_extension_status` is `'None'` or `'Denied'` (and the ticket is not Resolved/Closed).
  - Displays a disabled "SLA Extension Pending Approval" indicator if the status is `'Requested'`.
  - Wired the request button to the `PUT /api/tickets/:ticketId/request-sla` backend route.

### 2. `frontend/src/pages/AdminDashboard.jsx`
- **Change:** Added Admin UI for reviewing and taking action on SLA extension requests.
- **Specifics:**
  - Introduced a visual amber alert icon (`AlertCircle`) next to the ticket subject in both the "Active Issues" and "Global Archive" tables for tickets where `sla_extension_status === 'Requested'`.
  - Added "Approve" (green check) and "Deny" (red X) buttons to those specific rows.
  - Wired the buttons to `approve-sla` and `deny-sla` endpoints, automatically refreshing the tables on success.

# Changelog: Hard RBAC Enforcement & SLA UI Redesign (April 23, 2026)

## Frontend Authentication Flow Updates

### 1. `frontend/src/context/AuthContext.jsx`
- **Change:** Modified `login` and `signup` functions to return the complete `user` object upon successful authentication, allowing immediate synchronous evaluation of user roles.

### 2. `frontend/src/pages/Login.jsx`
- **Change:** Enforced a hard "Role-Barrier" to prevent portal crossover.
- **Specifics:**
  - Evaluates the returned user role immediately after authentication.
  - If a Customer attempts to log into the Staff Portal (`isStaff === true` and role is `'Customer'`), the system instantly triggers `logout()`, aborts navigation, and displays: "Access Denied: Staff credentials required."
  - If Staff attempts to log into the Customer Portal (`isStaff === false` and role is `'Agent'` or `'Admin'`), the system instantly triggers `logout()`, aborts navigation, and displays: "Access Denied: Please use the Staff Portal."

## Frontend UI Updates

### 1. `frontend/src/pages/AdminDashboard.jsx`
- **Change:** Redesigned the SLA Admin UI for clarity and descriptiveness.
- **Specifics:**
  - Replaced the simple icon badge with a highly visible, pulsating amber badge reading "Agent Requests 24h Extension" in both "Active Issues" and "Global Archive" tables.
  - Replaced raw action icons with descriptive, visually distinct buttons: a green button reading "Approve +24h" and a red button reading "Deny".
  - Organized the new action buttons inside a visually distinct block (`bg-amber-50`) to ensure admins know exactly what action they are taking.

# Changelog: Minor UI Text Update (April 23, 2026)

### 1. `frontend/src/pages/AdminDashboard.jsx`
- **Change:** Renamed "Global Archive" tab to "Global Oversight".
- **Specifics:**
  - Updated the user-facing text on the navigation tab and the table header.
  - Retained the underlying `archive` state variable and backend routing for stability.
