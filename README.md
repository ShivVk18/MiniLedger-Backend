# MiniLedger — Backend API Service

A robust, production-ready RESTful backend service for **MiniLedger**, a personal loan and lending tracking system. Built with **Node.js**, **Express 5**, **TypeScript**, **Prisma ORM 8 (Early Access Contract Engine)**, and **PostgreSQL**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Database Schema & Prisma 8](#database-schema--prisma-8)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Loans & Ledger](#loans--ledger)
  - [System](#system)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup & Migrations](#database-setup--migrations)
  - [Running the Server](#running-the-server)
- [Validation & Error Handling](#validation--error-handling)
- [Scripts Reference](#scripts-reference)

---

## 🌟 Overview

The MiniLedger API empowers users to track informal money lent to friends and family. It provides secure passwordless phone-based OTP authentication, loan lifecycle management (creation, listing, filtering, repayment status), overdue loan calculation using the modern Temporal API, and aggregated financial summaries.

---

## 🚀 Key Features

- **Passwordless Phone Authentication**: 6-digit OTP generation and verification flow with 5-minute expiry windows and JWT token issuance.
- **Loan Lifecycle Management**: Record loans with borrower's name, principal amount, and agreed due date; mark loans as repaid with timestamp tracking.
- **Temporal Date Calculations**: Uses `temporal-polyfill` (ECMAScript Temporal proposal) for precise, timezone-safe date comparison and dynamic `isOverdue` status calculation.
- **Financial Aggregation**: Real-time summary endpoint calculating `totalLent`, `totalRepaid`, and `overdueAmount` across the user's loans.
- **Strict Input Validation**: All input payloads validated with **Zod** schemas, preventing malformed data.
- **Prisma 8 ORM**: Utilizes Prisma's next-generation contract-driven ORM (`@prisma/orm-postgres` and `@prisma/cli-engine`) for typed database operations.
- **JWT Authorization**: Express middleware enforcing Bearer token authentication on protected resources.

---

## 🛠 Tech Stack

| Component | Technology | Version / Notes |
| :--- | :--- | :--- |
| **Runtime** | Node.js | `>= 22.11.0` |
| **Language** | TypeScript | `^6.0.3` (ES2022, NodeNext modules) |
| **Framework** | Express | `^5.3.0` |
| **ORM** | Prisma ORM | `^8.0.0-rc.25` (`@prisma/orm-postgres`) |
| **Database** | PostgreSQL | `>= 15` (required by Prisma 8) |
| **Validation** | Zod | `^4.6.7` |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | `^9.0.3` |
| **Date/Time** | Temporal Polyfill (`temporal-polyfill`) | `^1.0.6` |
| **Dev Execution**| TSX (`tsx`) | `^4.23.15` (Fast TypeScript watcher) |

---

## 📁 Architecture & Directory Structure

The backend follows a modular, feature-based architecture separating controllers, services, routes, and validation schemas:

```
Backend/
├── migrations/                 # Prisma database migration history & snapshots
│   ├── app/
│   └── snapshots/
├── src/
│   ├── index.ts               # Application entrypoint & HTTP server listener
│   ├── app.ts                 # Express application initialization & middleware setup
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT Bearer authentication & user injection
│   │   └── error.middleware.ts # Global error-handling middleware
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   └── loans/             # Loans and ledger module
│   │       ├── loans.controller.ts
│   │       ├── loans.routes.ts
│   │       ├── loans.service.ts
│   │       └── loans.validation.ts
│   ├── prisma/
│   │   ├── contract.prisma    # Prisma 8 schema data contract
│   │   ├── contract.json      # Compiled contract metadata
│   │   ├── contract.d.ts      # Auto-generated TypeScript types
│   │   └── db.ts              # Initialized PostgreSQL client export
│   └── routes/
│       └── index.ts           # Central route aggregator (`/api`)
├── .env.example               # Template for environment configuration
├── package.json               # Dependencies and scripts
├── prisma.config.ts           # Prisma ORM CLI configuration
└── tsconfig.json              # TypeScript compiler settings
```

---

## 🗄 Database Schema & Prisma 8

MiniLedger uses **Prisma ORM 8** contract-driven schemas. The contract is defined in [`src/prisma/contract.prisma`](src/prisma/contract.prisma):

```prisma
// use prisma-8

model User {
  id        String   @id @onCreate(uuid())
  phone     String   @unique
  createdAt DateTime @default(now())

  loans Loan[]
}

model Loan {
  id         String     @id @onCreate(uuid())
  userId     String
  friendName String
  amount     Float
  dueDate    DateTime
  status     LoanStatus @default(PENDING)
  repaidAt   DateTime?
  createdAt  DateTime   @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([dueDate])
}

model OtpCode {
  id        String   @id @onCreate(uuid())
  phone     String
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([phone])
}

enum LoanStatus {
  PENDING
  REPAID
}
```

### Prisma 8 CLI Commands

Whenever you modify `contract.prisma`, run the following commands:

```bash
# Re-emit TypeScript types (contract.d.ts) and JSON definitions (contract.json)
npx prisma contract emit

# Initialize / sync tables in your PostgreSQL database
npx prisma db init

# Check current migration status
npx prisma migration status
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `Backend` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Configure the following variables:

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String | *Required* | PostgreSQL connection string (`postgresql://user:pass@localhost:5432/miniledger`) |
| `PORT` | Number | `4000` | Port on which the Express server listens |
| `JWT_SECRET` | String | *Required* | Secret key used to sign and verify JSON Web Tokens |

> **Note on PostgreSQL Version:** Prisma 8 requires **PostgreSQL 15 or newer**. Verify your version with `SELECT version();`.

---

## 📡 API Documentation

Base URL: `http://localhost:4000` (or `http://10.0.2.2:4000` for Android emulators)

All protected routes require the following HTTP header:
```http
Authorization: Bearer <your_jwt_token>
```

---

### Authentication

#### 1. Request OTP
Generates a 6-digit one-time password valid for 5 minutes. (In development, the OTP is printed directly to the server terminal console).

- **URL:** `/api/auth/send-otp`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "phone": "9876543210"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```

---

#### 2. Verify OTP & Login
Validates the OTP code against the database. Automatically creates the user account if it doesn't already exist and invalidates the OTP.

- **URL:** `/api/auth/verify-otp`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "phone": "9876543210",
    "code": "123456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c1f7a0b3-9876-4d21-9988-123456789abc",
      "phone": "9876543210"
    }
  }
  ```

---

#### 3. Current User Profile
Retrieves authenticated user details decoded from the JWT token.

- **URL:** `/api/me`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "userId": "c1f7a0b3-9876-4d21-9988-123456789abc",
      "phone": "9876543210"
    }
  }
  ```

---

### Loans & Ledger

#### 4. Create Loan
Records a new loan extended to a friend.

- **URL:** `/api/loans`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "friendName": "Rohan Sharma",
    "amount": 2500,
    "dueDate": "2026-11-15T18:30:00.000Z"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "loan": {
      "id": "f5e4d3c2-b1a0-4987-9876-abcdef012345",
      "userId": "c1f7a0b3-9876-4d21-9988-123456789abc",
      "friendName": "Rohan Sharma",
      "amount": 2500,
      "dueDate": "2026-11-15T18:30:00.000Z",
      "status": "PENDING",
      "repaidAt": null,
      "createdAt": "2026-10-24T12:00:00.000Z"
    }
  }
  ```

---

#### 5. List All Loans
Retrieves all loans belonging to the authenticated user ordered newest first. Dynamically evaluates `isOverdue` against the current instant.

- **URL:** `/api/loans`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "loans": [
      {
        "id": "f5e4d3c2-b1a0-4987-9876-abcdef012345",
        "userId": "c1f7a0b3-9876-4d21-9988-123456789abc",
        "friendName": "Rohan Sharma",
        "amount": 2500,
        "dueDate": "2026-11-15T18:30:00.000Z",
        "status": "PENDING",
        "repaidAt": null,
        "createdAt": "2026-10-24T12:00:00.000Z",
        "isOverdue": false
      }
    ]
  }
  ```

---

#### 6. Mark Loan as Repaid
Transitions a loan from `PENDING` to `REPAID` and sets `repaidAt` to the current timestamp.

- **URL:** `/api/loans/:id/repay`
- **Method:** `PATCH`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "loan": {
      "id": "f5e4d3c2-b1a0-4987-9876-abcdef012345",
      "status": "REPAID",
      "repaidAt": "2026-10-24T12:30:00.000Z"
    }
  }
  ```

---

#### 7. Financial Summary
Provides aggregated lending statistics for the user dashboard.

- **URL:** `/api/loans/summary`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "summary": {
      "totalLent": 15000,
      "totalRepaid": 5000,
      "overdueAmount": 2500
    }
  }
  ```

---

### System

#### 8. Health Check
- **URL:** `/health`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "MiniLedger API is running"
  }
  ```

---

## 💻 Getting Started

### Prerequisites

- **Node.js** `>= 22.11.0`
- **npm** `>= 10.0.0`
- **PostgreSQL** `>= 15` running locally or accessible via network

### Installation

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL database URL, port, and JWT secret.

### Database Setup & Migrations

1. Ensure your PostgreSQL server is running and the database exists (e.g. `createdb miniledger`).
2. Generate Prisma contract artifacts and sync database tables:
   ```bash
   npx prisma contract emit
   npx prisma db init
   ```

### Running the Server

#### Development Mode (with hot-reload):
```bash
npm run dev
```
The server will start on `http://localhost:4000`. Console logs will output generated OTP codes for testing.

#### Production Build:
```bash
npm run build
npm start
```

---

## 🛡 Validation & Error Handling

- **Zod Schemas**:
  - `phone`: Exactly 10 digits (`/^[0-9]{10}$/`).
  - `code`: Exactly 6 digits (`/^[0-9]{6}$/`).
  - `friendName`: 1 to 100 trimmed characters.
  - `amount`: Positive floating-point number (`> 0`).
  - `dueDate`: Valid ISO-8601 date-time string.
- **Consistent Error Responses**: All errors return a predictable JSON payload:
  ```json
  {
    "success": false,
    "message": "Friend name is required"
  }
  ```

---

## 📜 Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `tsx watch src/index.ts` | Starts development server with hot-reloading |
| `npm run build` | `tsc` | Compiles TypeScript code to `dist/` |
| `npm start` | `node dist/index.js` | Runs compiled production server |
