# CampusConnect - Smart Campus Management Platform

A full-stack web application for smart college management and communication. Built with React, Node.js, Express, MongoDB, and Socket.IO.

## 🎯 Features

✅ **Authentication**: JWT-based login/register with role-based access (Admin/Faculty/Student)  
✅ **QR Attendance**: Real-time QR code generation and scanning  
✅ **Assignment Management**: Upload, submit, and grade assignments  
✅ **Real-time Notifications**: Socket.IO powered instant updates  
✅ **Analytics Dashboard**: Attendance trends, performance insights  
✅ **Gamification**: Points, badges, and leaderboard system  
✅ **Profile Management**: Edit account details and change password  
✅ **Responsive Design**: Mobile-friendly UI with modern styling  

## 🏗️ Tech Stack

**Frontend**: React 18 + Vite + TailwindCSS + Recharts  
**Backend**: Node.js + Express.js + Socket.IO  
**Database**: MongoDB Atlas + Mongoose  
**Authentication**: JWT (Access + Refresh Tokens)  
**File Storage**: Multer (Local/S3 ready)  

## 📦 Installation

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Git

### Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/campusconnect
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PORT=5000
```

Run:
```bash
npm start          # Production
npm run dev        # Development with nodemon
node seed.js       # Populate demo data
```

### Frontend Setup

```bash
cd client
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Run:
```bash
npm run dev        # Development
npm run build      # Production build
```

## 🚀 Deployment

### Backend → Render
1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create New Web Service
4. Set environment variables (see DEPLOYMENT_CHECKLIST.md)
5. Deploy

### Frontend → Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set `VITE_API_URL` environment variable
4. Deploy

**Full deployment guide**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🧪 Demo Credentials

After running `node seed.js`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusconnect.edu | admin123 |
| Faculty | sharma@campusconnect.edu | faculty123 |
| Student | rahul@campusconnect.edu | student123 |

## 📊 Project Structure

```
campusconnect/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Role-based pages
│   │   ├── context/             # Auth & Socket context
│   │   ├── api/                 # Axios instance
│   │   └── App.jsx              # Main app
│   └── vite.config.js
│
└── server/                      # Node.js backend
    ├── controllers/             # Business logic
    ├── models/                  # Mongoose schemas
    ├── routes/                  # API endpoints
    ├── middleware/              # Auth, CORS, upload
    ├── services/                # Socket.IO, gamification
    ├── config/                  # Database config
    └── index.js                 # Express server
```

## 🔑 Key Endpoints

**Auth**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

**Attendance**
- `POST /api/attendance/create` - Create QR session
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/history` - Attendance records

**Assignments**
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/assignments/:id/grade` - Grade submission

**Profile**
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password

## 🛡️ Security Features

✅ JWT token-based authentication  
✅ Password hashing with bcryptjs  
✅ CORS protection  
✅ Role-based access control  
✅ Secure password reset  
✅ Email normalization  

## 📱 Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is part of MCA capstone project. All rights reserved.

## 📧 Support

For issues or questions, please contact the development team.

---

**Made with ❤️ for campus management**
