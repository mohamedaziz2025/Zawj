# 📚 ZAWJ Documentation Index

## Quick Navigation

### Getting Started
1. **[README.md](./README.md)** - 🌟 Start here! Project overview and features
2. **[CONFIG.md](./CONFIG.md)** - 🔧 Setup, environment variables, and deployment

### For Developers
1. **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** - 📋 What was built and where
2. **[CONFIG.md#structure](./CONFIG.md#structure-dossiers)** - 📁 Project structure
3. **[CONFIG.md#commands](./CONFIG.md#commandes-usuelles)** - 💻 Useful commands

### For Admin Users
1. **[ADMIN_DOCS.md](./ADMIN_DOCS.md)** - 👨‍💼 Admin panel guide and features
2. **[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)** - ✅ Pre-launch verification

### For Users
1. **[REGISTRATION_DOCS.md](./REGISTRATION_DOCS.md)** - 📝 How to register and use mahram system

### Technical Documentation
1. **[CONFIG.md#api](./CONFIG.md#api)** - 🔌 API endpoints and setup
2. **[ADMIN_DOCS.md#endpoints](./ADMIN_DOCS.md#api-endpoints)** - 🌐 Admin API reference
3. **[REGISTRATION_DOCS.md#api](./REGISTRATION_DOCS.md#api-endpoints-inscription)** - 📡 Registration API

### Troubleshooting & Support
1. **[CONFIG.md#troubleshooting](./CONFIG.md#dépannage)** - 🐛 Common issues and fixes
2. **[CONFIG.md#performance](./CONFIG.md#performance)** - ⚡ Performance tips
3. **[CONFIG.md#monitoring](./CONFIG.md#monitoring--logs)** - 📊 Monitoring and logs

---

## 📄 Document Descriptions

### 1. README.md
**What**: Project overview, features, stack, quick start  
**Who**: Everyone - start here!  
**Why**: Understand the big picture of ZAWJ  
**Length**: 5 min read  

### 2. CONFIG.md
**What**: Setup, environment variables, deployment, commands  
**Who**: Developers and DevOps  
**Why**: Configure your local environment and understand the stack  
**Length**: 10 min read  

### 3. ADMIN_DOCS.md
**What**: Admin panel features, management, security, API endpoints  
**Who**: Administrators and backend developers  
**Why**: Understand how to manage the platform  
**Length**: 15 min read  

### 4. REGISTRATION_DOCS.md
**What**: Registration flow, mahram system, API, testing  
**Who**: Developers and product managers  
**Why**: Understand the unique woman-mahram registration flow  
**Length**: 10 min read  

### 5. COMPLETION_SUMMARY.md
**What**: Files created, features implemented, next steps  
**Who**: Technical leads  
**Why**: See what was built and what's left to do  
**Length**: 5 min read  

### 6. LAUNCH_CHECKLIST.md
**What**: Pre-launch verification checklist, testing, deployment  
**Who**: QA and launch team  
**Why**: Ensure everything is production-ready  
**Length**: 15 min read  

---

## 🎯 By Use Case

### I'm a new developer on this project
1. Read [README.md](./README.md) - Get the overview
2. Read [CONFIG.md](./CONFIG.md) - Setup locally
3. Read [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - See what was built
4. Explore `/zawj/src` and `/backend/src` - Dive into code

### I need to set up the environment
1. Read [CONFIG.md#setup](./CONFIG.md#setup-local)
2. Follow environment variable setup
3. Start MongoDB
4. Run `npm install` and `npm run dev`

### I need to add a new feature
1. Check [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - See existing structure
2. Follow the module pattern in backend
3. Create pages/components in frontend
4. Add API calls via hooks
5. Test end-to-end

### I need to deploy to production
1. Check [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) - Pre-flight checks
2. Follow deployment instructions in [CONFIG.md](./CONFIG.md)
3. Verify environment variables
4. Test production build locally
5. Deploy to Vercel/Railway

### I'm an administrator
1. Read [ADMIN_DOCS.md](./ADMIN_DOCS.md) - Understand admin features
2. Login to `/admin` with admin account
3. Follow the guides for each section

### I need to understand the registration flow
1. Read [REGISTRATION_DOCS.md](./REGISTRATION_DOCS.md) - Complete guide
2. Test registration flow locally
3. Verify mahram creation in admin panel

### I'm troubleshooting an issue
1. Check [CONFIG.md#troubleshooting](./CONFIG.md#dépannage)
2. Check logs in `/backend/logs`
3. Check browser console
4. Verify environment variables

### I need to add a new API endpoint
1. Create service in `/backend/src/modules/your-module/`
2. Create routes in `/backend/src/modules/your-module/your-module.routes.ts`
3. Add middleware if needed
4. Register routes in `app.ts`
5. Create hook in `/zawj/src/hooks/`
6. Use in components

---

## 🔐 Permission Levels

### Public (No auth required)
- `/login` - Login page
- `/register` - Registration page
- `/health` - Health check endpoint

### User (Auth required)
- `/` - Home page
- `/search` - Search page
- `/chat` - Chat page
- `/profile` - Profile page
- `/api/users/*` - User API calls
- `/api/chat/*` - Chat API calls
- `/api/subscription/*` - Subscription API calls

### Admin (Auth + Admin role required)
- `/admin` - Admin dashboard
- `/admin/users` - Users management
- `/admin/mahrams` - Mahrams management
- `/admin/reports` - Reports management
- `/api/admin/*` - All admin API calls

---

## 📦 Tech Stack Quick Reference

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 14 |
| Frontend | React | 18 |
| Frontend | TypeScript | 5 |
| Frontend | Tailwind | 3 |
| Frontend | Framer Motion | 10 |
| State Mgmt | Zustand | 4 |
| Server Cache | React Query | 5 |
| HTTP Client | Axios | 1 |
| Real-time | Socket.io | 4 |
| Backend | Express.js | 4 |
| Backend | TypeScript | 5 |
| Database | MongoDB | 6 |
| ODM | Mongoose | 7 |
| Validation | Zod | 3 |
| Auth | JWT | jsonwebtoken |
| Password | bcrypt | 5 |
| Security | Helmet | 7 |
| Rate Limit | express-rate-limit | 7 |

---

## 🚀 Key Features & Where They Are

| Feature | Frontend | Backend | Database |
|---------|----------|---------|----------|
| Registration | `/register` | `/auth/register` | users collection |
| Mahram Creation | `register/page.tsx` | `users/user.service.ts` | users collection |
| Login | `/login` | `/auth/login` | JWT tokens |
| User Search | `/search` | `/users/search` | users collection |
| Chat | `/chat` | `/chat/*` | conversations collection |
| Admin Dashboard | `/admin` | `/admin/stats` | users collection |
| User Management | `/admin/users` | `/admin/users` | users collection |
| Mahram Approval | `/admin/mahrams` | `/admin/mahrams` | users collection |
| Report Moderation | `/admin/reports` | `/admin/reports` | reports collection |

---

## 🧪 Testing Strategy

### Frontend Testing
```bash
npm run lint              # Code quality
npm run test              # Unit tests
npm run build            # Build validation
```

### Backend Testing
```bash
npm run lint              # Code quality
npm run test              # Unit tests
npm run build            # TypeScript check
```

### API Testing
```bash
# Manual testing with curl or Postman
curl http://localhost:5000/health

# Or use provided test accounts in CONFIG.md
```

### Full Stack Testing
1. Start backend: `npm run dev` in `/backend`
2. Start frontend: `npm run dev` in `/zawj`
3. Open http://localhost:3000
4. Test registration → admin flow

---

## 📞 Support & Contact

- **Documentation Issues**: Check relevant .md file
- **Setup Problems**: See CONFIG.md#troubleshooting
- **Feature Questions**: Check ADMIN_DOCS.md or REGISTRATION_DOCS.md
- **Deployment Help**: See LAUNCH_CHECKLIST.md

---

## 📅 Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| README.md | 1.0 | 28 Jan 2026 |
| CONFIG.md | 1.0 | 28 Jan 2026 |
| ADMIN_DOCS.md | 1.0 | 28 Jan 2026 |
| REGISTRATION_DOCS.md | 1.0 | 28 Jan 2026 |
| COMPLETION_SUMMARY.md | 1.0 | 28 Jan 2026 |
| LAUNCH_CHECKLIST.md | 1.0 | 28 Jan 2026 |

---

## 🎓 Learning Path

**For Beginners:**
1. README.md → Understand the project
2. CONFIG.md → Set up locally
3. Explore the UI in browser
4. Read REGISTRATION_DOCS.md → Understand flow
5. Make small UI changes

**For Experienced Developers:**
1. COMPLETION_SUMMARY.md → See architecture
2. CONFIG.md → Set up
3. Review `/backend/src/modules` → Understand patterns
4. Review `/zawj/src` → Frontend architecture
5. Start adding features

**For DevOps/Infrastructure:**
1. CONFIG.md#deployment → Deployment options
2. LAUNCH_CHECKLIST.md → Production checklist
3. CONFIG.md#monitoring → Monitoring setup
4. Setup CI/CD pipeline

---

**Happy coding! 🚀**

*Questions? Check the relevant documentation file above!*
