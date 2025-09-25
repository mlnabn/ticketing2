📋 OVERVIEW PROJECT
Project ini adalah sistem ticketing berbasis web yang memungkinkan pengelolaan tiket pekerjaan dengan fitur lengkap untuk admin dan user biasa. Sistem ini menggunakan arsitektur full-stack dengan React.js di frontend dan Laravel di backend. Proyek ini telah melalui proses refactoring signifikan di sisi frontend untuk meningkatkan struktur, skalabilitas, dan kemudahan pemeliharaan.

🏗️ ARSITEKTUR TEKNOLOGI
FRONTEND
Framework: React.js 19.1.1

Routing: React Router DOM 6.25.1

State Management: React Context API (AuthContext untuk state autentikasi global)

Struktur Folder: Pages, Components, Routes, Services (Pemisahan Logika dan Tampilan)

Build Tool: React Scripts 5.0.1

Styling: CSS3 dengan variabel untuk dark/light mode

HTTP Client: Axios 1.11.0 (dengan instance terpusat untuk API calls)

UI Libraries:

React Icons 5.5.0

Lucide React 0.542.0

Framer Motion 12.23.12 (animasi)

React Select 5.10.2 (dropdown)

React Calendar 6.0.0

Swiper 11.2.10 (carousel)

BACKEND
Framework: Laravel 12.0

PHP Version: 8.2+

Authentication: JWT Auth (tymon/jwt-auth 2.2) & Google OAuth

API Security: Laravel Sanctum 4.0

Database: MySQL

DATA VISUALIZATION
Charts: Recharts 3.1.2

Maps: Leaflet 1.9.4 + React Leaflet 5.0.0

Date Handling: Date-fns 4.1.0

🎨 PENDEKATAN UI/UX
DESAIN VISUAL
Theme System: Dark/Light mode dengan toggle switch

Glassmorphism: Efek transparan dan blur pada card components

Gradient Colors: Penggunaan gradient untuk tombol dan teks

Responsive Design: Mobile-first approach dengan breakpoints

NAVIGASI
Admin Dashboard: Sidebar navigation dengan 5 menu utama

User Interface: Tab-based navigation (Request/History)

Public Pages: Landing page dengan navigasi header yang dikelola oleh React Router

INTERAKSI
Real-time Updates: Auto-refresh data setiap 1 menit di halaman daftar tiket admin.

Modal System: Multiple modal types untuk berbagai aksi.

Notification System: Bell icon dengan badge count.

Form Validation: Client-side validation dengan feedback.

🚀 FITUR-FITUR UTAMA
AUTHENTICATION & AUTHORIZATION
✅ Login/Register dengan JWT & Login dengan Google (OAuth2)

✅ Manajemen Sesi Terpusat via React Context (AuthContext)

✅ Protected Routes dengan RequireAuth dan RequireRole untuk role-based access

✅ Token & data user tersimpan aman di localStorage

✅ Auto-logout reaktif saat token expired (terdeteksi dari respons API 401)

✅ Proses registrasi dengan verifikasi OTP melalui WhatsApp

TICKET MANAGEMENT
✅ Buat tiket baru dengan workshop selection

✅ Sistem kode tiket unik (CNddmmXXXX format)

✅ Status tracking: Belum Dikerjakan → Sedang Dikerjakan → Selesai/Ditolak

✅ Bulk operations (delete multiple tickets)

✅ Proof submission dengan upload gambar

✅ Rejection system dengan alasan

USER MANAGEMENT (Admin Only)
✅ CRUD users

✅ Role assignment

✅ Search dan pagination

NOTIFICATION SYSTEM
✅ Global notifications (admin broadcast)

✅ Personal notifications

✅ Mark as read functionality

✅ Delete notifications

ANALYTICS & REPORTING
✅ Line charts (30-day ticket trends)

✅ Pie charts (status distribution)

✅ Bar charts (admin performance)

✅ Map visualization (geographic data)

✅ Calendar view (ticket timeline)

PUBLIC FEATURES
✅ Landing page dengan navigasi

✅ About Us page dengan team info

✅ Features showcase

✅ FAQ section dengan feedback system

✅ Halaman Status Tiket Publik: Pengguna dapat melihat status tiket individu melalui URL unik (/history/:ticketCode) tanpa harus login.

📊 STRUKTUR DATABASE
TABEL UTAMA
users - User management dengan role-based access

tickets - Core ticket data dengan status tracking

notifications - System notifications

personal_access_tokens - Sanctum authentication

RELASI
Tickets → Users (creator_id)

Tickets → Users (user_id - assignee)

Notifications → Users

🔧 STRUKTUR KOMPONEN REACT (REFACTORED)
CORE & ROUTING
App.js: Komponen Root yang mengatur routing aplikasi menggunakan React Router. Tidak lagi menangani state aplikasi secara langsung.

AuthContext.js: Penyedia context yang mengelola state autentikasi global (user, token, status login) dan menyediakannya ke seluruh aplikasi.

routes/: Folder berisi komponen pelindung rute seperti RequireAuth.jsx dan RequireRole.jsx.

services/: Folder untuk manajemen API terpusat (api.js) dan fungsi-fungsi fetch data.

PAGES COMPONENTS (SMART COMPONENTS)
AdminDashboard.jsx: Mengelola semua state dan logika khusus untuk dashboard admin.

UserDashboard.jsx: Mengelola semua state dan logika khusus untuk dashboard pengguna.

LoginPage.jsx: Mengelola logika untuk proses login (email/password & Google).

RegisterPage.jsx: Mengelola alur registrasi multi-langkah (form & OTP).

Landing.jsx: Bertindak sebagai layout untuk halaman-halaman publik dan menangani callback login Google.

PublicTicketPage.jsx: Halaman untuk menampilkan detail satu tiket kepada publik.

REUSABLE COMPONENTS (UI COMPONENTS)
Login.js / Register.js: Komponen presentasional murni untuk form.

JobList.js: Menampilkan daftar tiket untuk admin dan pengguna.

UserManagement.js: Tabel dan logika UI untuk CRUD pengguna.

ProfileModal.js, ConfirmationModal.js, dll.: Berbagai komponen modal untuk interaksi pengguna.

LineChartComponent.js, PieChartComponent.js, dll.: Komponen visualisasi data.

🌐 API ENDPOINTS
AUTHENTICATION
POST /api/login - User login

POST /api/register - User registration

GET /api/user - Get current user

POST /api/logout - User logout

GET /api/auth/google/redirect: Mengarahkan pengguna untuk login dengan Google.

GET /api/auth/google/callback: Menangani callback setelah login Google berhasil.

POST /api/otp/verify: Memverifikasi OTP yang dikirimkan saat registrasi.

TICKETS
GET /api/tickets - List tickets dengan filters

POST /api/tickets - Create new ticket

PATCH /api/tickets/{id}/status - Update status

PATCH /api/tickets/{id}/assign - Assign to admin

PATCH /api/tickets/{id}/reject - Reject ticket

POST /api/tickets/{id}/submit-proof - Submit proof

DELETE /api/tickets/{id} - Delete ticket

POST /api/tickets/bulk-delete - Bulk delete

GET /api/tickets/stats - Statistics

GET /api/tickets/analytics - Analytics data

GET /api/tickets/admin-performance - Performance metrics

GET /api/tickets/by-code/{code}: Mengambil detail tiket berdasarkan kode uniknya untuk tampilan publik.

USERS
GET /api/users - List users

POST /api/users - Create user

GET /api/users/{id} - Get user

POST /api/users/{id} - Update user

DELETE /api/users/{id} - Delete user

GET /api/admins - List admins only

NOTIFICATIONS
GET /api/notifications - User notifications

POST /api/notifications - Create notification (admin)

POST /api/notifications/mark-all-read - Mark all read

DELETE /api/notifications/{id} - Delete notification

🛠️ DEVELOPMENT TOOLS
FRONTEND DEPENDENCIES
JSON

{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^6.25.1",
  "axios": "^1.11.0",
  "react-icons": "^5.5.0",
  "framer-motion": "^12.23.12",
  "recharts": "^3.1.2",
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "date-fns": "^4.1.0",
  "react-select": "^5.10.2",
  "react-calendar": "^6.0.0",
  "swiper": "^11.2.10"
}
BACKEND DEPENDENCIES
JSON

{
  "laravel/framework": "^12.0",
  "laravel/sanctum": "^4.0",
  "tymon/jwt-auth": "^2.2"
}
📱 RESPONSIVE DESIGN
BREAKPOINTS
Mobile: ≤ 480px

Tablet: 481px - 1008px

Desktop: ≥ 1009px

MOBILE FEATURES
Hamburger menu untuk sidebar

Card-based tables

Touch-friendly buttons

Optimized form layouts

🔒 SECURITY FEATURES
JWT Authentication

Role-based authorization

API rate limiting (Laravel built-in)

CORS configuration

Input validation both client and server side

File upload validation

🚀 POTENSI PENGEMBANGAN
FITUR YANG BISA DITAMBAH
Email notifications

PDF report generation

Advanced search filters

Ticket categories and priorities

Time tracking

Customer rating system

Implementasi Refresh Token untuk pengalaman login yang lebih mulus dan aman.

OPTIMIZATION
Lazy loading untuk charts dan halaman

Image optimization

API response caching

Database indexing

PWA capabilities

📊 PERFORMANCE CONSIDERATIONS
Component memoization sudah digunakan (React.memo, useCallback).

API calls dioptimalkan dengan useCallback untuk mencegah re-fetching yang tidak perlu.

Pagination untuk kumpulan data yang besar.

Image lazy loading

Chart data virtualization

🎯 KESIMPULAN (SETELAH REFACTOR)
Proses refactoring telah berhasil mentransformasi arsitektur frontend dari aplikasi monolitik di dalam App.js menjadi struktur modern yang modular, skalabel, dan sangat mudah dikelola (maintainable).

✅ Pemisahan Tanggung Jawab (Separation of Concerns): Logika, tampilan, routing, dan manajemen state kini berada di file dan modul yang terpisah, mengikuti praktik terbaik React.

✅ Manajemen State yang Kuat: Penggunaan React Context menyediakan cara yang bersih dan efisien untuk mengelola data autentikasi di seluruh aplikasi.

✅ Routing Deklaratif: React Router memungkinkan navigasi yang jelas dan perlindungan rute yang elegan.

✅ Peningkatan Kinerja & Stabilitas: Dengan mengatasi race conditions dan infinite loops, aplikasi kini lebih stabil dan responsif.

✅ Kode yang Lebih Bersih: Penggunaan instance Axios terpusat dan pemisahan komponen "pintar" (pages) dari komponen "presentasional" membuat kode lebih mudah dibaca dan di-debug.