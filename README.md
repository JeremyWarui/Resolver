# Resolver - Maintenance Ticketing System

A modern, enterprise-grade maintenance ticketing system with role-based dashboards, real-time analytics, and comprehensive reporting.

**React 18** • **TypeScript** • **Django REST** • **shadcn/ui** • **Tailwind CSS**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://reactjs.org/)

> **🚀 Quick Start:** `npm install` → `npm run dev` → http://localhost:5173  
> **📖 Full Documentation:** See [`docs/`](client/docs/) folder for architecture, API reference, and deployment guides

---

## ✨ Key Features

- 🎭 **Multi-Role Dashboards** - Admin, Technician, and User interfaces with role-based access
- 🎫 **Complete Ticket Lifecycle** - Create, assign, track, and resolve with real-time status updates
- 📊 **Real-Time Analytics** - Performance metrics, trends, and multi-persona reporting
- ⚡ **Instant Filtering** - Client-side Quick Filters (66x faster with backend optimizations)
- 📈 **Advanced Reports** - Excel exports with custom date ranges for data analysis
- 💬 **Collaboration Tools** - Comments, feedback, and user satisfaction ratings
- 🏢 **Organization Management** - Facilities, sections, and comprehensive user administration

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript 5, Vite  
**UI:** shadcn/ui, Radix UI, Tailwind CSS 4  
**Data:** TanStack Table v8, React Hook Form, Zod  
**Backend:** Django REST Framework, Neon PostgreSQL, JWT Auth

## 📦 Installation

### Prerequisites
- Node.js 18+
- Running Django backend (see backend repository)

### Setup
```bash
# Clone and install
git clone <repository-url>
cd Resolver/client
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

Visit http://localhost:5173

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Local Development
VITE_API_URL=http://localhost:8000/api

# Production
# VITE_API_URL=https://your-backend.onrender.com/api
```

## 📜 Available Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # TypeScript check + production build
npm run preview   # Preview production build
npm run lint      # Run ESLint checks
```

## 📁 Project Structure

```
src/
├── api/              # Backend integration (services, client, interceptors)
├── components/       # React components by role (Admin/Tech/User/Common)
├── hooks/            # Domain-specific custom hooks
├── types/            # TypeScript type definitions
├── utils/            # Helper functions and utilities
└── constants/        # Application constants
```

## 🏗️ Architecture Highlights

- **Section-Based Navigation**: State-driven UI switching (not React Router nested routes)
- **DataTable System**: Reusable table infrastructure with filters, sorting, and pagination
- **Custom Hooks**: Domain-organized hooks for all API operations
- **Type Safety**: TypeScript types matching Django serializers exactly
- **Client-Side Filtering**: Fetch once, filter instantly with zero API calls

## 📚 Documentation

Comprehensive documentation available in [`docs/`](client/docs/):

- **[Architecture Guide](client/docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[REST API Reference](client/client/docs/REST_API_REFERENCE.md)** - Backend endpoints and payloads
- **[Vercel Deployment](client/docs/VERCEL_DEPLOYMENT.md)** - Production deployment guide
- **[Backend Alignment](client/docs/BACKEND_ALIGNMENT_REPORT.md)** - API issues and workarounds
- **[Reports Design](client/docs/REPORTS_PAGE_DESIGN.md)** - Analytics system specifications

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub, then:
# 1. Import to Vercel
# 2. Set VITE_API_URL environment variable
# 3. Deploy (automatic on push)
```

See [client/docs/VERCEL_DEPLOYMENT.md](client/docs/VERCEL_DEPLOYMENT.md) for complete guide.

## 🔑 Demo Accounts

```
Admin:       admin_user
Technician:  tech_alex
User:        jane_user
```
*Contact backend administrator for passwords*

## 🐛 Quick Troubleshooting

**CORS Errors?** Add frontend URL to Django's `CORS_ALLOWED_ORIGINS`  
**Auth Issues?** Clear localStorage and re-login  
**Build Errors?** Run `npm install` and check TypeScript errors  
**API Connection?** Verify `VITE_API_URL` matches running backend

For detailed troubleshooting, see [client/docs/ARCHITECTURE.md](client/docs/ARCHITECTURE.md)

## ⚠️ Development Conventions

**DO:**
- Use `@/` path alias for all imports
- Use DataTable component for all tables
- Create domain hooks for API calls
- Use client-side Quick Filters
- Match types to Django serializers

**DON'T:**
- Add nested routes inside layouts
- Recreate table markup manually
- Call services directly from components
- Trigger API calls on filter clicks

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for comprehensive guidelines.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow existing patterns and conventions
4. Test locally: `npm run dev` and `npm run build`
5. Submit pull request with clear description

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with [shadcn/ui](https://ui.shadcn.com/), [TanStack Table](https://tanstack.com/table), [Recharts](https://recharts.org/), and [Tailwind CSS](https://tailwindcss.com/)

---

**Questions or Issues?** Check the [`docs/`](client/docs/) folder or open an issue on GitHub.
