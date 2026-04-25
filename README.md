# Thai To Go

![CI](https://github.com/austinchaang/ts-mern-thaitogo/actions/workflows/test.yml/badge.svg?branch=main)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Node](https://img.shields.io/badge/node-22.x-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A full-stack e-commerce web application for **Chad Thai**, a Thai restaurant. Built with the MERN stack and TypeScript, it supports user authentication, product browsing, order management, and PayPal checkout.

**Live:** https://thaitogo.austinchang.ca

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Security](#security)
- [Testing & CI/CD](#testing--cicd)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [License](#license)

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 4.18.x | REST API server |
| TypeScript | 5.4.x | Type-safe server code |
| MongoDB + Mongoose | 9.x | Database + ODM |
| Typegoose | 13.x | TypeScript-first Mongoose models |
| JSON Web Tokens | 9.x | Authentication |
| bcryptjs | 2.4.x | Password hashing |
| express-rate-limit | 8.x | Rate limiting |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type-safe client code |
| Vite | 4.x | Build tool |
| React Router DOM | 6.x | Client-side routing |
| TanStack React Query | 5.x | Server state management |
| React Bootstrap | 2.x | UI components |
| Axios | 1.x | HTTP client |
| PayPal React SDK | 8.x | Payment processing |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Heroku | Cloud deployment |
| Nginx | Frontend static file serving |
| MongoDB Atlas | Managed database hosting |
| GitHub Actions | CI/CD pipeline |

---

## Features

- **User authentication** — register and sign in with JWT-based sessions (30-day expiry)
- **Product catalog** — browse menu items with descriptions, pricing, ratings, and stock status
- **Shopping cart** — add items and proceed to checkout
- **Order management** — place orders with shipping address and view order history
- **PayPal checkout** — integrated PayPal payment processing with transaction tracking
- **Admin tooling** — seed route for populating the database (admin-only)
- **Fully typed** — end-to-end TypeScript on both frontend and backend

---

## Security

| Measure | Details |
|---|---|
| JWT authentication | Bearer tokens, 30-day expiry, validated on protected routes |
| Password hashing | bcryptjs with salted hashing |
| Role-based access control | `isAuth` and `isAdmin` middleware guard protected endpoints |
| Rate limiting | 20 requests / 15 min on `/api/users` routes (disabled in test env) |
| CORS | Restricted to known origins (localhost, production frontend, custom domain) |
| Input validation | Email regex, password length (6–100 chars), name length (max 100 chars), required field checks |
| Request size limits | JSON and URL-encoded bodies capped at 10 kb |
| Duplicate email prevention | Case-insensitive email uniqueness check on signup |
| Secrets via environment | JWT secret, DB URI, and PayPal client ID never hardcoded |

---

## Testing & CI/CD

The backend has **51 tests** across all API routers with **100% statement, line, and function coverage**.

```
Test Suites: 5 passed, 5 total
Tests:       51 passed, 51 total
Coverage:    100% statements | 100% branches | 100% functions | 100% lines
```

Tests are written with **Jest** and **SuperTest**, using an isolated test database (`NODE_ENV=test`).

Every push and pull request to `main` automatically runs the full test suite via **GitHub Actions** (see [`.github/workflows/test.yml`](.github/workflows/test.yml)).

To run tests locally:

```bash
cd backend
npm test
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- MongoDB (local or Atlas)
- A PayPal developer account (or use `sb` for sandbox)

### Installation

```bash
# Clone the repository
git clone https://github.com/austinchaang/ts-mern-thaitogo.git
cd ts-mern-thaitogo

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Start the backend (from /backend)
npm run dev

# Start the frontend (from /frontend)
npm run dev
```

The backend runs on `http://localhost:4000` and the frontend on `http://localhost:5173` by default.

### Docker

```bash
docker-compose up --build
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PAYPAL_CLIENT_ID=your_paypal_client_id   # use "sb" for sandbox
PORT=4000
NODE_ENV=development
```

For the test environment, create `backend/.env.test`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<test-database>?retryWrites=true&w=majority
JWT_SECRET=your_test_jwt_secret
PAYPAL_CLIENT_ID=sb
NODE_ENV=test
```

The three production secrets (`MONGODB_URI`, `JWT_SECRET`, `PAYPAL_CLIENT_ID`) must also be added as **GitHub repository secrets** for CI to run.

---

## API Routes

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/users/signin` | None | Sign in; returns user data and JWT token |
| `POST` | `/api/users/signup` | None | Register a new user; returns user data and JWT token |

### Products — `/api/products`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/products` | None | Fetch all products |
| `GET` | `/api/products/slug/:slug` | None | Fetch a single product by slug |

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/orders/mine` | JWT | Fetch all orders for the authenticated user |
| `GET` | `/api/orders/:id` | JWT | Fetch a single order by ID (owner only) |
| `POST` | `/api/orders` | JWT | Create a new order |
| `PUT` | `/api/orders/:id/pay` | JWT | Mark an order as paid (PayPal) |

### Keys — `/api/keys`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/keys/paypal` | None | Returns the PayPal client ID |

### Seed — `/api/seed`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/seed` | JWT + Admin | Clears and re-seeds the database with sample products and users |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Austin Chang — [changaustinj@gmail.com](mailto:changaustinj@gmail.com)

Project Link: [https://thaitogo.austinchang.ca](https://thaitogo.austinchang.ca)
