# 🏢 Heritage Condo Management System

A comprehensive web-based management platform built specifically for small to mid-size condominium associations. This system helps board members, treasurers, and property managers handle financials, payments, vendors, and unit owner communications all in one place.

## 🎯 Why This Project Exists

Many small condo associations struggle with expensive property management software or outdated accounting firms that don't provide real-time access to financial data. This app was created to give board members **full transparency and control** over their association's finances and operations.

**Built for**: Heritage Condominium Association (24 units, North Miami, Florida)  
**Can be used by**: Any small condo or HOA looking for affordable, modern management tools

---

## ✨ Key Features

### 💰 Financial Management
- **Unit Ledger Tracking** - See what each unit owes in real-time
- **Multiple Assessment Types** - Track regular dues AND special assessments separately
- **Payment Recording** - Record payments with proper allocation (Florida FS 718.116 compliant)
- **Budget Planning** - Create annual budgets and track actual vs. planned spending
- **Financial Reports** - Generate monthly reports with one click

### 📋 Vendor & Invoice Management
- **Vendor Database** - Store all vendor contacts (elevator company, landscaping, utilities, etc.)
- **Invoice Upload** - Upload and track invoices with PDF support (max 10MB)
- **Approval Workflow** - Review and approve invoices before payment
- **Payment Tracking** - Know exactly what's been paid and what's pending

### 🏘️ Unit & Owner Management
- **Unit Directory** - Complete database of all units and owners
- **Contact Information** - Phone, email, emergency contacts
- **Delinquency Tracking** - Flag high-risk units for collections
- **Communication Tools** - Send notices and updates to owners

### 📊 Dashboard & Reporting
- **Real-Time Overview** - See financial health at a glance
- **Monthly Reports** - Automatically generated financial statements
- **Delinquency Alerts** - Know immediately who's behind on payments
- **Budget vs. Actual** - Track spending against your budget

### 🤖 AI-Powered Features
- **Smart Budget Suggestions** - AI helps create realistic budgets based on history
- **Financial Analysis** - Get insights on spending patterns
- **Automated Reporting** - AI generates professional monthly reports

---

## 🛠️ Technology Stack

### Frontend
- **React** with **Vite** - Fast, modern web interface
- **TypeScript** - Type-safe code for fewer bugs
- **Tailwind CSS** - Beautiful, responsive design
- **Shadcn UI** - Professional component library
- **Lucide Icons** - Clean, modern icons

### Backend
- **Node.js** with **Express** - Fast API server
- **TypeScript** - End-to-end type safety
- **PostgreSQL** - Reliable, powerful database
- **Prisma ORM** - Easy database management

### Services & Integrations
- **Stripe** - Secure payment processing
- **Anthropic Claude API** - AI-powered features
- **PDF Support** - Invoice and report generation
- **Email Integration** - Automated notifications

### Deployment
- **Frontend**: Netlify
- **Backend**: Render.com
- **Database**: PostgreSQL (Render or Supabase)
- **Version Control**: GitHub

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **PostgreSQL** database
- **Git** installed
- Basic command line knowledge

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jaristilde/Heritage-condo-management.git
cd Heritage-condo-management
```

2. **Install dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/heritage_condo"

# Server
PORT=10000
NODE_ENV=development

# Authentication
SESSION_SECRET="your-random-secret-key-here"

# Stripe (get from stripe.com)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Claude AI (get from anthropic.com)
ANTHROPIC_API_KEY="sk-ant-..."

# Frontend URL (for CORS)
CORS_ORIGIN="http://localhost:5173"
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed initial data (optional)
npm run seed
```

5. **Start the development servers**

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

6. **Open your browser**
```
http://localhost:5173
```

**Default Login:**
- Username: `board`
- Password: `board123`

---

## 📁 Project Structure

```
Heritage-condo-management/
├── client/                  # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and helpers
│   │   └── App.tsx         # Main app component
│   └── package.json
│
├── src/                    # Backend Express app
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication, validation
│   └── index.ts           # Server entry point
│
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
│
├── .env                   # Environment variables (not in git)
├── package.json           # Backend dependencies
└── README.md              # This file
```

---

## 🔐 Security Features

- **Password Hashing** - All passwords encrypted with bcrypt
- **Session Management** - Secure session handling
- **SQL Injection Protection** - Prisma ORM prevents injection attacks
- **CORS Protection** - Only allowed domains can access API
- **Environment Variables** - Sensitive data never in code
- **HTTPS Ready** - Production deployment uses SSL

---

## 📖 Usage Guide

### For Board Members
1. **Login** with your board credentials
2. **Dashboard** shows current financial status
3. **Record Payments** when owners pay their dues
4. **Review Invoices** from vendors before approval
5. **Generate Reports** monthly for board meetings
6. **Track Delinquencies** and contact owners as needed

### For Treasurers
1. **Manage Budgets** - Create and update annual budgets
2. **Track Expenses** - Record all association spending
3. **Monitor Cash Flow** - See real-time financial position
4. **Generate Reports** - Professional financial statements
5. **Vendor Management** - Keep all vendor contacts organized

### For Property Managers (if applicable)
1. **Update Unit Information** - Keep owner data current
2. **Process Payments** - Record payments from multiple units
3. **Manage Work Orders** - Track maintenance requests
4. **Communicate with Owners** - Send notices and updates

---

## 🌟 Florida-Specific Compliance

This app follows **Florida Statute 718.116(3)** for payment allocation:
1. Interest on debt
2. Late fees
3. Attorney's fees and costs
4. Assessments (operational and special)

**FIFO Enforcement**: Payments automatically apply to oldest charges first

---

## 🤝 Contributing

Contributions are welcome! This project is open source to help other small condo associations.

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions
- Additional report templates
- More payment gateway integrations
- Mobile app version
- Multi-language support
- Improved AI features
- Better accessibility features

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- Single association per deployment (not multi-tenant)
- Email notifications not yet implemented
- Mobile app in planning stages
- Limited to 24 units (can be expanded)

### Planned Features
- [ ] Owner portal (owners can view their own ledger)
- [ ] Automated email notifications
- [ ] Mobile app (iOS/Android)
- [ ] Multi-association support
- [ ] Advanced reporting with charts
- [ ] Document management system
- [ ] Meeting minutes tracking
- [ ] Voting system for board decisions

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**What this means:**
- ✅ Free to use for any purpose
- ✅ Free to modify and customize
- ✅ Free to distribute
- ✅ Can be used commercially
- ⚠️ No warranty or liability

---

## 💡 About This Project

**Created by**: Joane Aristilde, Board Member & Treasurer  
**Organization**: Heritage Condominium Association  
**Location**: North Miami, Florida  
**Purpose**: Give small condo boards the tools they need to manage their associations effectively

This project was born out of frustration with expensive property management software and unresponsive accounting firms. Every condo board should have access to real-time financial data and modern management tools - regardless of budget.

---

## 📞 Support & Contact

### Questions about the code?
- **Open an issue** on GitHub
- **Email**: [your-email@example.com]

### Want to use this for your condo?
- **Fork this repo** and customize it
- **Check the Wiki** for setup guides
- **Join discussions** in GitHub Discussions

### Need help deploying?
- See our **Deployment Guide** in the Wiki
- Check **Issues** for common problems
- Ask in **GitHub Discussions**

---

## 🙏 Acknowledgments

- **Heritage Condo Owners** - For trusting this system
- **Open Source Community** - For amazing tools and libraries
- **Anthropic Claude** - For AI capabilities
- **Stripe** - For payment processing
- **Vercel/Netlify/Render** - For affordable hosting

---

## ⚖️ Legal Disclaimer

This software is provided as-is for use by condominium associations. While it follows Florida statutes and accounting best practices, please consult with your:
- **Licensed CPA** for financial matters
- **Attorney** for legal compliance
- **Insurance Agent** for liability coverage

The creators assume no liability for financial or legal decisions made using this software.

---

## 📊 Stats

![GitHub Stars](https://img.shields.io/github/stars/jaristilde/Heritage-condo-management?style=social)
![GitHub Forks](https://img.shields.io/github/forks/jaristilde/Heritage-condo-management?style=social)
![GitHub Issues](https://img.shields.io/github/issues/jaristilde/Heritage-condo-management)
![GitHub License](https://img.shields.io/github/license/jaristilde/Heritage-condo-management)

---

**⭐ If this project helps your condo association, please give it a star!**

**🐛 Found a bug? [Report it here](https://github.com/jaristilde/Heritage-condo-management/issues)**

**💡 Have an idea? [Share it here](https://github.com/jaristilde/Heritage-condo-management/discussions)**

---

Made with ❤️ for small condo associations everywhere
