# Mini CRM - Lead & Task Management System

A comprehensive, full-stack Customer Relationship Management (CRM) platform designed strictly for high-efficiency enterprise teams. Built heavily on the MERN stack with modern responsive design aesthetics and robust backend routing.

## 🚀 Tech Stack

### Frontend Architecture
- **Framework:** React.js + Vite
- **Routing:** React Router v6
- **Styling:** Vanilla Tailwind CSS (Dynamic Dark/Light Mode Engine)
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Icons & UI Elements:** Lucide React

### Backend Infrastructure
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Local Compass via Mongoose ORM)
- **Security:** JWT (JSON Web Tokens) & bcrypt (Password Hashing)
- **Middleware:** Custom Error Handlers, Authorization Verifications

---

## 🏢 Project Overview
This platform is engineered to handle an influx of corporate leads efficiently through the following workflow:
1. **Admin creates a Lead.**
2. **Admin Assigns Lead** to a specific Employee.
3. **Employee actively Follows-up** on that Lead.
4. If a Deal is completed, the Status natively converts to **Won**.
5. All corporate progress is visualized instantly on the **Analytics Dashboard**.

---

## ⚙️ Core Modules & Business Logic

### 1. Authentication Module
- Contains robust Login flow checking securely against the backend.
- Handles user sessions through **JWT Tokens**.
- Role-Based Access logic mapped sequentially through the portal UI.

### 2. Dashboard & Analytics Module
- Displays KPI statistic cards: `Total Leads`, `Today's Follow-ups`, `Won Deals`, `Pending Leads`.
- Graphical rendering via **Recharts**, completely synced to the MongoDB pipeline.
  - **Area/Bar Chart:** Monthly Chronological Leads mapping.
  - **Donut Chart:** Sliced Lead Status distribution.

### 3. Employee Module `(Employees.jsx / employeeController.js)`
- **Role Permissions:** Distinct differences explicitly tracked for `Admin` vs `Standard`.
- Handles Employee configurations: Name, Email, Phone, Department, and Status.
- Admins possess the UI and Routing logic to **Add / Edit / Remove** active employees.

### 4. Lead Module `(LeadsList.jsx / LeadForm.jsx)`
- High-level CRM tracking variables: `Company, Contact Person, Phone, Email, Expected Budget, Priority, Status, Assigned Employee`.
- **Status Lifecycle Progression:**
  - `New → Contacted → Qualified → Proposal Sent → Won/Lost`.
- **Business Rule Constraints:**
  - Standard Leads cannot jump straight to Won/Lost. They must safely progress sequentially through logical CRM steps (e.g. `Qualified -> Proposal Sent -> Won`).
  - You **cannot delete** a Lead mathematically if the Status explicitly equals `Won`.

### 5. Follow-ups Module (WIP Architecture Layouts exist)
- Intended for chronological CRM touchpoint registrations mapping directly to unique Lead IDs.
- Calculates `Followup Date`, evaluates against the `Today Date`, and pushes Overdue alerts physically onto the main Dashboard screen.

---

## 📂 Project Architecture / File Structure

### Backend (Node / Express) - `server/`
The system manages the core Mongoose schemas and handles secure Express route validations.
* `/config` - Environment bootstrapping.
* `/controllers` - Contains all Database manipulation logic `(authController, employeeController, dashboardController)`.
* `/middleware` - Houses the `errorHandler.js` intercepting JWT / Validation fails.
* `/models` - Houses the heavily validated Mongoose DB Schemas: `Employee.js`, `Lead.js`, `Note.js`, `User.js`.
* `/routes` - Connects incoming HTTP request URLs instantly to backend Controllers.

### Frontend (React / Tailwind) - `client/`
The visual display engine running the browser user interface.
* `/src/components` - Reusable UI blocks like `Navbar.jsx` (which contains Theme Toggling mechanisms and user session displays) and `Sidebar.jsx`.
* `/src/layouts` - Global layout wrappers, most importantly `DashboardLayout.jsx` handling authenticated context.
* `/src/pages` - Standalone Full-screen views handling distinct module routing (`Dashboard.jsx`, `Employees.jsx`, `EmployeeForm.jsx`, `LeadForm.jsx`).
* `tailwind.config.js` - Stores the core UI Dark Mode override class logic triggering high-contrast redesigns dynamically.

---

## 🛠️ How To Setup & Work
1. Ensure **MongoDB Compass** is natively installed and actively running on your desktop `localhost:27017`.
2. Inside `/server`, ensure `.env` is configured to `MONGO_URI=mongodb://127.0.0.1:27017/adheen2`.
3. Open two separate system terminal instances. 
4. In terminal 1: `cd server` then `npm run dev`.
5. In terminal 2: `cd client` then `npm run dev`.
6. Open your standard Chrome browser to `http://localhost:5173`.
7. You may now mathematically insert Employees, manage active Leads, and watch charts dynamically update inside the React UI.
