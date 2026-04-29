# CampusConnect - User Credentials

## Overview
This document contains all test user credentials for the CampusConnect platform. All passwords are: **123456** for default test users, or as specified below.

**Default Password for All Users**: `student123` (for students), `faculty123` (for faculty), `admin123` (for admin)

---

## 👨‍💼 ADMIN ACCOUNT

| Role | Email | Password | Department |
|------|-------|----------|-----------|
| Admin | `admin@campusconnect.edu` | `admin123` | Administration |

---

## 👨‍🏫 FACULTY ACCOUNTS (6 Faculty Members)

| Name | Email | Password | Department | Phone |
|------|-------|----------|-----------|-------|
| Prof. Sharma | `sharma@campusconnect.edu` | `faculty123` | MCA | 9876543211 |
| Prof. Gupta | `gupta@campusconnect.edu` | `faculty123` | MCA | 9876543212 |
| Prof. Singh | `singh@campusconnect.edu` | `faculty123` | MCA | 9876543213 |
| Prof. Patel | `patel@campusconnect.edu` | `faculty123` | MCA | 9876543214 |
| Prof. Kumar | `kumar@campusconnect.edu` | `faculty123` | MCA | 9876543215 |
| Prof. Verma | `verma@campusconnect.edu` | `faculty123` | MCA | 9876543216 |

---

## 👨‍🎓 STUDENT ACCOUNTS (25 Students)

| Name | Email | Password | Roll No | Semester | Points |
|------|-------|----------|---------|----------|--------|
| Rahul Kumar | `rahul@campusconnect.edu` | `student123` | MCA001 | 2 | 320 |
| Priya Patel | `priya@campusconnect.edu` | `student123` | MCA002 | 2 | 410 |
| Amit Singh | `amit@campusconnect.edu` | `student123` | MCA003 | 2 | 150 |
| Sneha Reddy | `sneha@campusconnect.edu` | `student123` | MCA004 | 2 | 380 |
| Kiran Mehta | `kiran@campusconnect.edu` | `student123` | MCA005 | 2 | 420 |
| Vikas Pandey | `vikas@campusconnect.edu` | `student123` | MCA006 | 2 | 280 |
| Neha Singh | `neha@campusconnect.edu` | `student123` | MCA007 | 2 | 350 |
| Arjun Kapoor | `arjun@campusconnect.edu` | `student123` | MCA008 | 2 | 180 |
| Sana Khan | `sana@campusconnect.edu` | `student123` | MCA009 | 2 | 390 |
| Rohan Chopra | `rohan@campusconnect.edu` | `student123` | MCA010 | 2 | 290 |
| Anjali Sharma | `anjali.s@campusconnect.edu` | `student123` | MCA011 | 2 | 440 |
| Manoj Desai | `manoj@campusconnect.edu` | `student123` | MCA012 | 2 | 120 |
| Divya Nair | `divya@campusconnect.edu` | `student123` | MCA013 | 2 | 370 |
| Harsh Verma | `harsh@campusconnect.edu` | `student123` | MCA014 | 2 | 220 |
| Priya Singh | `priya.s@campusconnect.edu` | `student123` | MCA015 | 2 | 400 |
| Abhishek Roy | `abhishek@campusconnect.edu` | `student123` | MCA016 | 2 | 260 |
| Sakshi Yadav | `sakshi@campusconnect.edu` | `student123` | MCA017 | 2 | 360 |
| Nitin Saxena | `nitin@campusconnect.edu` | `student123` | MCA018 | 2 | 100 |
| Shreya Malhotra | `shreya@campusconnect.edu` | `student123` | MCA019 | 2 | 430 |
| Deepak Tomar | `deepak@campusconnect.edu` | `student123` | MCA020 | 2 | 250 |
| Pooja Mishra | `pooja@campusconnect.edu` | `student123` | MCA021 | 2 | 340 |
| Rajesh Kumar | `rajesh@campusconnect.edu` | `student123` | MCA022 | 2 | 200 |
| Isha Patel | `isha@campusconnect.edu` | `student123` | MCA023 | 2 | 380 |
| Sanjay Nair | `sanjay@campusconnect.edu` | `student123` | MCA024 | 2 | 140 |
| Kavya Sinha | `kavya@campusconnect.edu` | `student123` | MCA025 | 2 | 410 |

---

## 📚 COURSES (10 Courses)

| Course Code | Course Name | Credits | Faculty | Semester |
|------------|-------------|---------|---------|----------|
| MCA201 | Advanced Algorithms | 4 | Prof. Sharma | 2 |
| MCA202 | Web Technologies | 3 | Prof. Sharma | 2 |
| MCA203 | Database Management | 4 | Prof. Gupta | 2 |
| MCA204 | Computer Networks | 3 | Prof. Gupta | 2 |
| MCA205 | Machine Learning | 4 | Prof. Singh | 2 |
| MCA206 | Cloud Computing | 3 | Prof. Singh | 2 |
| MCA207 | Cybersecurity | 4 | Prof. Patel | 2 |
| MCA208 | AI & Deep Learning | 3 | Prof. Patel | 2 |
| MCA209 | Software Engineering | 4 | Prof. Kumar | 2 |
| MCA210 | Big Data Analytics | 3 | Prof. Verma | 2 |

---

## 📊 DATA STATISTICS

### Seed Data Created:
- **1** Admin
- **6** Faculty Members
- **25** Students
- **10** Courses
- **200** Attendance Sessions (20 per course)
- **5,000** Attendance Records
- **5** Announcements

### Attendance Distribution:
- **8 Students** with 90-95% attendance (Good Standing)
- **9 Students** with 70-80% attendance (At-Risk)
- **8 Students** with 50-70% attendance (Critical Risk)

---

## 🔑 Quick Login References

### For Testing Attendance Management:
```
Faculty: sharma@campusconnect.edu / faculty123
Student: rahul@campusconnect.edu / student123
```

### For Admin Testing:
```
Admin: admin@campusconnect.edu / admin123
```

### High Attendance Student (Reference):
```
Email: priya@campusconnect.edu / student123
Attendance: 410 points (Excellent)
```

### Low Attendance Student (Reference):
```
Email: nitin@campusconnect.edu / student123
Attendance: 100 points (Critical - Below 75%)
```

---

## 🔒 Security Notes

⚠️ **IMPORTANT**: These are test credentials only. Never use these in production.
- Change all passwords before deploying to production
- Never commit actual credentials to version control
- Use environment variables for sensitive data
- Implement proper authentication mechanisms

---

## 📝 Default Semester: 2
## 📍 Default Department: MCA (Master of Computer Applications)

---

Last Updated: April 29, 2026
