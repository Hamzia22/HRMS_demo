# HRM System — Human Resource Management Demo Application

A clean, modern, and fully functional Human Resource Management (HRM) web application built with **Next.js (App Router)** and a **Node.js Express REST API**.

This project provides a complete local demonstration of core HR operations, featuring role-based access control, employee records management, department oversight, daily attendance tracking, and leave request workflows.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Roles & Permissions](#roles--permissions)
5. [Demo Login Credentials](#demo-login-credentials)
6. [Installation Steps](#installation-steps)
7. [Starting the Application](#starting-the-application)
8. [Available REST API Endpoints](#available-rest-api-endpoints)
9. [Limitations of the Demo Implementation](#limitations-of-the-demo-implementation)

---

## Project Overview

The HRM Demo System is designed to demonstrate full-stack HR operations with a clean architecture:
- **Decoupled Architecture**: Separated Next.js frontend and Node.js backend communicating strictly via REST APIs.
- **Role-Based Workflows**: Distinct access levels for **Admin**, **HR**, **Manager**, and **Employee** roles.
- **Employee CRUD**: Complete lifecycle management including adding new hires, updating employee records, toggling active status, and inspecting detailed employee profiles.
- **Leave Application & Review**: Employees apply for time off; Administrators, HR officers, and Team Managers review and approve or reject applications in real time.
- **Daily Attendance Tracking**: Log check-ins, check-outs, present/absent/late/leave statuses, with date filters and daily presence summaries.
- **Department Management**: Organize employees by department with live headcount tracking and integrity constraints preventing deletion of populated units.

---

## Technology Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: React 19
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS Design System with CSS variables, modern cards, responsive grids, and modal dialogs.
- **State & Auth**: React Context (`AuthContext`) with persistent JWT token storage in `localStorage`.

### Backend
- **Runtime**: Node.js
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Security**: JWT (`jsonwebtoken`) authentication middleware, password hashing with `bcryptjs`, and CORS configuration.
- **Data Persistence**: In-memory modular demo stores formatted to easily swap with a relational or document database (PostgreSQL/MongoDB).

---

## Folder Structure

```
HRMS_demo/
├── package.json                   # Root package runner scripts
├── README.md                      # Complete system documentation
└── hrm-system/
    ├── package.json               # System runner package
    ├── scripts/
    │   └── start-both.js          # Concurrent launcher script
    │
    ├── backend/                   # Express.js REST API
    │   ├── server.js              # Server entry point & port configuration
    │   ├── package.json           # Backend dependencies
    │   ├── middleware/
    │   │   └── auth.js            # JWT verification & role authorization
    │   ├── routes/
    │   │   ├── auth.js            # /api/auth/login, logout, me
    │   │   ├── employees.js       # /api/employees CRUD
    │   │   ├── departments.js     # /api/departments CRUD
    │   │   ├── attendance.js      # /api/attendance logs & summary
    │   │   ├── leaves.js          # /api/leaves requests & reviews
    │   │   └── dashboard.js       # /api/dashboard aggregated metrics
    │   └── data/
    │       ├── users.js           # User accounts with bcrypt hashing
    │       ├── employees.js       # Demo employee records & manager linkages
    │       ├── departments.js     # Company departments
    │       ├── attendance.js      # Daily presence logs
    │       └── leaves.js          # Leave request history
    │
    └── frontend/                  # Next.js App Router Application
        ├── package.json           # Frontend dependencies
        ├── next.config.mjs        # Next.js configuration & API URL
        ├── context/
        │   └── AuthContext.js     # User session & login state
        ├── lib/
        │   └── api.js             # Centralized API service layer with port fallback
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.js     # Role-aware navigation sidebar
        │   │   └── Header.js      # Top header with user profile badge
        │   └── ui/
        │       ├── Badge.js       # Colored status indicator badge
        │       └── StatCard.js    # Metric dashboard card
        └── app/
            ├── layout.js          # Root HTML layout & AuthProvider wrapper
            ├── globals.css        # Complete CSS design system
            ├── page.js            # Root redirector (to login or dashboard)
            ├── login/
            │   └── page.js        # Authentication page with quick credentials
            └── dashboard/
                ├── layout.js      # Protected dashboard shell
                ├── page.js        # Redirects to role-specific dashboard
                ├── admin/page.js  # Administrator dashboard
                ├── hr/page.js     # HR specialist dashboard
                ├── manager/page.js# Team manager dashboard
                ├── employee/page.js # Employee self-service portal
                ├── employees/
                │   ├── page.js    # Employee list, search, add, edit, deactivate
                │   └── [id]/page.js # Detailed employee profile
                ├── departments/page.js # Department management & headcounts
                ├── attendance/page.js  # Daily attendance tracking
                ├── leaves/page.js      # Leave requests & approval workflow
                └── profile/page.js     # User account & linked employee record
```

---

## Roles & Permissions

| Feature / Action | Admin | HR | Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| **Admin Dashboard** |  Yes | No | No | No |
| **HR Dashboard** | Yes | Yes | No | No |
| **Manager Dashboard** | Yes | No | Yes | No |
| **Employee Self-Service** | Yes | Yes | Yes | Yes |
| **View Employees** | All | All | Team Only | Self Only |
| **Add / Edit Employees** | Yes | Yes | No | No |
| **Deactivate Employees** | Yes | Yes | No | No |
| **View Departments** | Yes | Yes | No | No |
| **Create / Delete Departments** | Yes | No | No | No |
| **View Attendance** | All | All | Team Only | Self Only |
| **Submit Leave Request** | Any Emp | Any Emp | Team/Self | Self Only |
| **Approve / Reject Leaves** | All | All | Team Only | No |

---

## Demo Login Credentials

You can use the one-click quick login buttons directly on the `/login` page, or enter the credentials below:

| Role | Email | Password | Permissions Description |
|---|---|---|---|
| **Admin** | `admin@hrm.com` | `admin123` | Highest access: full employee CRUD, department management, all approvals |
| **HR** | `hr@hrm.com` | `hr123` | Staff oversight: employee management, leave approvals, company attendance |
| **Manager** | `manager@hrm.com` | `manager123` | Team lead: view assigned team members, approve team leaves, track team presence |
| **Employee** | `employee@hrm.com` | `employee123` | Individual staff: personal attendance, submit leave requests, view profile |

---

## Installation Steps

Ensure you have **Node.js (v18+)** and **npm** installed on your system.

Clone the repository and install all dependencies:

```bash
# Option 1: Using root convenience script
npm run install:all

# Option 2: Manually in each subdirectory
cd hrm-system/backend && npm install
cd ../frontend && npm install
```

---

## Starting the Application

### Method 1: Start Both Simultaneously (Recommended)
From the repository root or `hrm-system/`:

```bash
npm run dev:all
```
This starts both the backend API and the frontend development server concurrently.

### Method 2: Start Separately in Two Terminal Windows

**Terminal 1 — Backend API:**
```bash
cd hrm-system/backend
npm start
# Server starts on http://localhost:5000 (or http://localhost:5001 if 5000 is occupied by macOS AirPlay)
```

**Terminal 2 — Frontend Application:**
```bash
cd hrm-system/frontend
npm run dev
# Frontend starts on http://localhost:3000
```

### URLs
- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000) (Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health))

> **macOS Note**: On macOS, port `5000` is reserved by the built-in AirPlay Receiver (`ControlCenter`). The backend server automatically detects this and falls back to port `5001`, and the frontend API client is configured to seamlessly adapt to either port.

---

## Available REST API Endpoints

### Authentication
- `POST /api/auth/login` — Authenticate user and obtain JWT token (`email`, `password`)
- `POST /api/auth/logout` — Invalidate user session
- `GET  /api/auth/me` — Retrieve current authenticated user (`Bearer <token>`)

### Dashboard Metrics
- `GET  /api/dashboard/stats` — Role-specific aggregated KPI metrics

### Employees
- `GET   /api/employees` — List employees (Admin/HR: all; Manager: team; Employee: self)
- `GET   /api/employees/stats` — Overall counts and department distribution
- `GET   /api/employees/:id` — Get single employee profile
- `POST  /api/employees` — Create new employee *(Admin, HR)*
- `PUT   /api/employees/:id` — Update employee information *(Admin, HR)*
- `PATCH /api/employees/:id/status` — Toggle employee status (`Active`, `Inactive`, `On Leave`) *(Admin, HR)*

### Departments
- `GET    /api/departments` — List departments with live employee headcounts
- `GET    /api/departments/:id` — Get department by ID
- `POST   /api/departments` — Create new department *(Admin only)*
- `PUT    /api/departments/:id` — Update department details *(Admin only)*
- `DELETE /api/departments/:id` — Delete department *(Admin only, prevents deletion if employees assigned)*

### Attendance
- `POST /api/attendance/check-in` — Employee daily check-in (authenticates identity, prevents duplicate check-in)
- `POST /api/attendance/check-out` — Employee daily check-out (requires existing check-in, prevents duplicate check-out)
- `GET  /api/attendance/today` — Retrieve today's check-in/out status for current user
- `GET  /api/attendance/my-history` — Employee's personal attendance history
- `GET  /api/attendance` — Query attendance logs (`?date=YYYY-MM-DD`, role-scoped)
- `GET  /api/attendance/today/summary` — Today's attendance counts (Present, Absent, Late, On Leave)
- `GET  /api/attendance/employee/:employeeId` — Historical logs for specific employee

### Leaves
- `GET    /api/leaves` — Query leave applications (`?status=Pending|Approved|Rejected`)
- `GET    /api/leaves/stats` — Leave counts (Total, Pending, Approved, Rejected)
- `GET    /api/leaves/:id` — Get single leave request
- `POST   /api/leaves` — Submit new leave application
- `PUT    /api/leaves/:id/status` — Update approval status (`Approved` or `Rejected`) *(Admin, HR, Manager)*
- `DELETE /api/leaves/:id` — Cancel pending leave application *(Employee self, Admin)*

### Payroll Management
- `GET  /api/payroll` — List all monthly payroll records *(Admin, HR)*
- `GET  /api/payroll/stats` — Monthly payroll summary stats (total payroll, processed, pending, paid) *(Admin, HR)*
- `GET  /api/payroll/my` — Employee's personal monthly payroll & history *(Employee self)*
- `GET  /api/payroll/:id` — Full payslip breakdown *(Admin, HR, Employee for own record)*
- `POST /api/payroll/generate` — Batch generate or regenerate monthly payroll *(Admin, HR)*
- `PUT  /api/payroll/:id` — Edit salary allowances, overtime, or deductions *(Admin, HR)*
- `PUT  /api/payroll/:id/process` — Transition payroll status to `Processed` *(Admin, HR)*
- `PUT  /api/payroll/:id/pay` — Mark payroll record as `Paid` *(Admin, HR)*
- `GET  /api/payroll/salary/:employeeId` — Get base salary structure *(Admin, HR, Employee self)*
- `PUT  /api/payroll/salary/:employeeId` — Update employee compensation structure *(Admin, HR)*

---

## Limitations of the Demo Implementation

This project is a high-fidelity demonstration of HRM workflows and intentionally excludes enterprise production services:
- **In-Memory Storage**: Demo records reset when the backend server process restarts. The modular `data/` layer is organized so a database ORM (such as Prisma, PostgreSQL, or Mongoose) can be swapped in without modifying route controllers.
- **Biometric / GPS Hardware**: Clock-in and check-out logs are represented through interactive web check-in/out and demo logs rather than physical biometric hardware.
- **Third-Party Email / SMS**: Notification alerts are rendered in-app rather than via external SMTP providers.
- **Local Authentication**: Uses lightweight JWT and bcrypt rather than enterprise SSO / Okta integrations.
