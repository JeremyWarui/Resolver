# Resolver - Maintenance Ticketing System

A modern, role-based maintenance ticketing system built with React, TypeScript, and Django REST Framework.

## 🚀 Features

### Multi-Role Dashboards
- **Admin Dashboard**: Complete system oversight, analytics, reports, and user management
- **Technician Dashboard**: Personal ticket queue with quick filters and workflow actions
- **User Dashboard**: Simple ticket creation and tracking interface

### Core Functionality
- 🎫 **Ticket Management**: Create, assign, update, and track maintenance tickets
- 📊 **Analytics & Reports**: Real-time metrics, performance tracking, and Excel exports
- 👥 **User Management**: Role-based access control (Admin, Technician, User)
- 🏢 **Facility & Section Management**: Organize tickets by location and department
- 📈 **Performance Metrics**: Technician workload, resolution rates, and ratings
- 🔍 **Advanced Filtering**: Quick filters, search, and multi-column sorting
- 💬 **Comments & Feedback**: Internal communication and user satisfaction tracking

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI + Tailwind CSS 4
- **State Management**: React Hooks + Custom Hooks
- **Data Tables**: TanStack Table v8
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **HTTP Client**: Axios with interceptors
- **Backend**: Django REST Framework + Neon PostgreSQL

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and set your environment:
```env
# Development (local backend)
VITE_ENV=development

# Production (Neon database on Render)
VITE_ENV=production
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🔧 Environment Configuration

The app supports two environments with automatic API URL selection:

### Development Mode
Connects to local Django backend (`http://localhost:8000/api`)
```env
VITE_ENV=development
VITE_API_URL_DEV=http://localhost:8000/api
```

### Production Mode  
Connects to deployed backend on Render with Neon PostgreSQL
```env
VITE_ENV=production
VITE_API_URL_PROD=https://django-resolver.onrender.com/api
```

Switch between environments by changing `VITE_ENV` in `.env` file.

## 📜 Available Scripts

```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production (TypeScript + Vite)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
src/
├── api/                    # API client and services
│   ├── client.ts          # Axios instance
│   ├── config.ts          # API configuration
│   ├── interceptors.ts    # Auth interceptors
│   └── services/          # Domain-specific API services
├── components/            # React components
│   ├── AdminDashboard/   # Admin-specific pages
│   ├── TechnicianDashboard/  # Technician pages
│   ├── UserDashboard/    # User pages
│   ├── Common/           # Shared components
│   │   └── DataTable/    # Reusable table infrastructure
│   └── ui/               # shadcn/ui primitives
├── hooks/                # Custom React hooks
│   ├── analytics/        # Analytics data hooks
│   ├── tickets/          # Ticket management hooks
│   ├── users/            # User data hooks
│   └── index.ts          # Centralized exports
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── constants/            # App constants
```

## 🎨 Key Features & Patterns

### DataTable System
Reusable, feature-rich table component with:
- Column visibility toggles
- Multi-column sorting
- Global search + column filters
- Pagination with page size controls
- Role-based column configurations

### Custom Hooks Architecture
Domain-organized hooks for data fetching:
- `useTickets` - Ticket list with filters
- `useTicketTable` - Complete table state management
- `useTicketAnalytics` - Analytics data
- `useAdminAnalytics` - Dashboard metrics

### Form Validation
Type-safe forms with `react-hook-form` + `zod`:
```typescript
const formSchema = z.object({
  title: z.string().min(5),
  section_id: z.string(),
});
```

## 🚀 Deployment

### Vercel Deployment
See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for complete deployment guide.

**Quick Steps:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy
5. Update backend CORS settings

## 📚 Documentation

- [Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)
- [Deployment Instructions](docs/README.deployment.md)
- [Backend API Reference](docs/REST_API_REFERENCE.md)
- [Backend Alignment Report](docs/BACKEND_ALIGNMENT_REPORT.md)
- [Reports Page Design](docs/REPORTS_PAGE_DESIGN.md)

## 🔑 Default Login Credentials

### Admin
- **Username**: `admin_user`
- **Password**: (provided by backend)

### Technician
- **Username**: `tech_alex`
- **Password**: (provided by backend)

### User
- **Username**: `jane_user`
- **Password**: (provided by backend)

## 🐛 Troubleshooting

### CORS Errors
Ensure your frontend domain is added to Django's `CORS_ALLOWED_ORIGINS` in backend settings.

### API Connection Issues
- Verify `VITE_ENV` is set correctly
- Check backend is running (Render or localhost)
- Inspect browser console for environment logs

### Build Errors
```bash
npm run build  # Test locally first
```
Check TypeScript errors and ensure all dependencies are installed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [TanStack Table](https://tanstack.com/table) for powerful data tables
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
