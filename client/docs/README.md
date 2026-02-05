# Documentation Index
**Updated:** February 5, 2026

## 📚 Current Documentation

### **Core References**
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - **⭐ START HERE** - Complete frontend architecture, data flow, auth flow, directory structure
- [`BACKEND_ALIGNMENT_REPORT.md`](./BACKEND_ALIGNMENT_REPORT.md) - API alignment & optimization status
- [`PAGINATION_OPTIMIZATION_SUMMARY.md`](./PAGINATION_OPTIMIZATION_SUMMARY.md) - Recent performance improvements 
- [`REST_API_REFERENCE.md`](./REST_API_REFERENCE.md) - Updated hooks & API usage
- [`REPORTS_PAGE_DESIGN.md`](./REPORTS_PAGE_DESIGN.md) - Analytics dashboard design

### **Deployment**
- [`README.deployment.md`](./README.deployment.md) - Quick deployment guide
- [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) - Detailed Vercel configuration

---

## 🏗️ Architecture Overview

**For comprehensive architecture documentation, see [`ARCHITECTURE.md`](./ARCHITECTURE.md)**

### **Current System State (Feb 2026)**
```
✅ Full authentication flow with role-based routing
✅ Logout with loading states and consolidated hook
✅ Optimized pagination (up to 1000 items, client-side filtering)
✅ SharedDataContext reduces API calls by ~65%
✅ Enhanced admin workflows with bulk operations
✅ Professional UI with consistent loading feedback
✅ User dashboard cleanup (removed deprecated features)
```

### **Key Components**
- **Backend**: Django REST API with JWT authentication
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Auth Flow**: Token-based with localStorage persistence
- **Data Flow**: Unidirectional (Component → Hook → Service → API)
- **Tables**: DataTable system with role-based configurations
- **Loading States**: FullScreenLoading component for consistent UX

---

## 🎯 Quick Start

1. **Architecture & Patterns**: See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for complete structure
2. **Development**: See `.github/copilot-instructions.md` for coding patterns
3. **API Integration**: Use [`REST_API_REFERENCE.md`](./REST_API_REFERENCE.md) for hooks and endpoints
4. **Deployment**: Follow [`README.deployment.md`](./README.deployment.md) for production deploy
5. **Performance**: Review [`PAGINATION_OPTIMIZATION_SUMMARY.md`](./PAGINATION_OPTIMIZATION_SUMMARY.md) for optimizations

**For specific feature development, the ARCHITECTURE.md and Copilot instructions contain the most up-to-date architectural patterns and best practices.**