# 💰 FinanceFlow — Personal Finance Dashboard

An enterprise-grade full-stack web application to manage bank accounts, track spending, monitor investments, create budgets, and analyze financial health from one beautiful dashboard.

## 🚀 Features

- **📊 Financial Dashboard** — KPI cards with animated counters, interactive charts, budget overview
- **🏦 Multi-Account Management** — Create, edit, and track multiple bank accounts
- **💸 Transaction Tracking** — Full CRUD with filtering, pagination, and category breakdown
- **💰 Budget Management** — Monthly budgets with category-wise progress tracking
- **📈 Investment Portfolio** — Track stocks, crypto, gold, mutual funds with P&L analysis
- **📊 Financial Reports** — 4 interactive charts with date range selector
- **🔔 Notifications** — Smart alerts for budget overruns, bills, and spending patterns
- **🌙 Dark/Light Mode** — Premium dark theme with light mode toggle
- **📱 Fully Responsive** — Mobile, tablet, and desktop layouts

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts, Lucide React |
| Styling | Vanilla CSS with Custom Properties |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| HTTP Client | Axios |

## 📂 Project Structure

```
finance-dashboard/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI, Layout, Dashboard, Chart components
│   │   ├── context/         # UserContext, ThemeContext
│   │   ├── pages/           # 8 page components
│   │   ├── services/        # API service layer
│   │   ├── App.jsx          # Root component with routing
│   │   └── index.css        # Premium design system
│   └── index.html
├── server/                  # Express backend
│   ├── controllers/         # Business logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   └── utils/seedData.js    # Demo data seeder
└── package.json             # Root workspace config
```

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies (client + server)
npm install

# Seed the database with demo data
npm run seed

# Start both client and server
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

### Environment Variables

Create `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-dashboard
NODE_ENV=development
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get default user |
| PUT | `/api/users/me` | Update profile |
| GET/POST | `/api/accounts` | List/Create accounts |
| PUT/DELETE | `/api/accounts/:id` | Update/Delete account |
| GET/POST | `/api/transactions` | List/Create transactions |
| GET | `/api/transactions/summary` | Monthly summary |
| GET | `/api/transactions/categories` | Category breakdown |
| GET/POST | `/api/budgets` | List/Create budgets |
| GET | `/api/budgets/current` | Current month budget |
| GET/POST | `/api/investments` | List/Create investments |
| GET | `/api/investments/portfolio` | Portfolio summary |
| GET | `/api/dashboard/summary` | Dashboard KPIs |
| GET | `/api/dashboard/charts` | Chart data |
| GET/POST | `/api/notifications` | List/Create notifications |

## 🎨 Design

- **Dark Mode Default** with glassmorphism cards and gradient accents
- **Color Palette**: Deep navy backgrounds, emerald green (income), coral red (expenses), royal blue (primary), amber (warnings)
- **Typography**: Inter font with modular scale
- **Animations**: Fade-in, count-up KPIs, hover lifts, slide-in modals

## 📜 License

##Live Demo
**Link**  : https://webfinanceflow.vercel.app/

MIT
"# FInanceFlow" 
