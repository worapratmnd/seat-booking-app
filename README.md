# **Seat Booking System \- ระบบจองที่นั่งอเนกประสงค์**

ระบบจองที่นั่งแบบ Full-Stack ที่สร้างขึ้นด้วย Next.js และ PostgreSQL ออกแบบมาให้ใช้งานง่าย, ยืดหยุ่น, และง่ายต่อการพัฒนาต่อยอด ผู้ใช้สามารถเลือกวันที่ต้องการแล้วทำการจองได้ (ปัจจุบันรองรับการจอง “วันเดียวต่อหนึ่งรายการ”) ในขณะที่ผู้ดูแลระบบสามารถปรับแต่ง Layout ของที่นั่งและดูรายงานสรุปการจอง (แบบช่วงวันที่สำหรับการออกรายงานเท่านั้น) ได้

## **✨ Features (คุณสมบัติหลัก)**

### **สำหรับผู้ใช้งาน (User-Facing)**

* **Visual Seat Map:** แสดงแผนผังที่นั่งแบบ Real-time พร้อมสถานะสีที่ชัดเจน (เขียว \= ว่าง, แดง \= ไม่ว่าง)  
* **Date-Based Viewing:** สามารถเลือกดูสถานะที่นั่งว่างในวันที่ต้องการผ่านปฏิทิน  
* **Single-Day Booking:** เลือกวันและจองได้หนึ่งวันที่ต่อหนึ่งรายการ (อนาคตสามารถขยายให้รองรับช่วงวันได้)  
* **User Information on Seat:** แสดงชื่อของผู้ที่จองที่นั่งนั้นๆ เพื่อให้ง่ายต่อการระบุตัวตน

### **สำหรับผู้ดูแลระบบ (Admin-Facing)**

* **Dynamic Layout Customization:** สามารถกำหนดจำนวนแถวและจำนวนที่นั่งต่อแถวได้ตามต้องการผ่านหน้า Admin Panel  
* **Seat Label Management:** แก้ไขชื่อหรือ Label ของแต่ละที่นั่งได้ (เช่น A1, A2, VIP1)  
* **Booking Report Dashboard:** หน้า Dashboard สำหรับดูรายงานการจองทั้งหมดในช่วงวันที่ที่กำหนด  
* **Full CRUD on Bookings:** สามารถแก้ไข (Edit) และลบ (Delete) ข้อมูลการจองแต่ละรายการได้โดยตรงจาก Dashboard

## **🏛️ Architecture & Tech Stack**

โปรเจกต์นี้ถูกสร้างขึ้นบนสถาปัตยกรรม Monorepo ที่รวมทั้ง Frontend และ Backend API ไว้ในโปรเจกต์ Next.js เดียวกัน เพื่อความง่ายในการพัฒนาและ Deploy

**การทำงานของระบบ (Data Flow):**

1. **Frontend (React Server Components & Client Components):** ผู้ใช้โต้ตอบกับ UI ที่สร้างด้วย React และ shadcn/ui บน Next.js App Router  
2. **Next.js API Routes:** ทุกการร้องขอข้อมูล (เช่น การดึงข้อมูลที่นั่ง, การสร้างการจอง) จะถูกส่งไปยัง API Routes ภายในโปรเจกต์เอง (/api/\*)  
3. **Prisma ORM:** API Routes ใช้ Prisma Client เป็นตัวกลางในการสื่อสารกับฐานข้อมูล ทำให้การเขียน Query มีความปลอดภัยและเป็นระเบียบ  
4. **PostgreSQL Database:** ข้อมูลทั้งหมดเกี่ยวกับที่นั่ง (Seats) และการจอง (Bookings) จะถูกจัดเก็บไว้ในฐานข้อมูล PostgreSQL

### **🥞 Tech Stack**

* **Framework:** [Next.js](https://nextjs.org/) (App Router)  
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/)  
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)  
* **Database ORM:** [Prisma](https://www.prisma.io/)  
* **Database:** [PostgreSQL](https://www.postgresql.org/)  
* **Language:** TypeScript

## **📁 Project Structure (โครงสร้างโปรเจกต์)**

/  
├── app/  
│   ├── api/                  \# โฟลเดอร์สำหรับ API Routes ทั้งหมด  
│   │   ├── seats/  
│   │   │   ├── \[id\]/route.ts \# API สำหรับ PUT (แก้ไข) ที่นั่ง  
│   │   │   └── route.ts      \# API สำหรับ GET, POST ที่นั่ง  
│   │   └── bookings/  
│   │       ├── \[id\]/route.ts \# API สำหรับ PUT, DELETE การจอง  
│   │       └── route.ts      \# API สำหรับ GET, POST การจอง  
│   ├── admin/  
│   │   ├── dashboard/page.tsx \# หน้า Report Dashboard  
│   │   └── page.tsx           \# หน้าจัดการ Layout และชื่อที่นั่ง  
│   └── page.tsx              \# หน้าหลักสำหรับผู้ใช้งาน  
├── components/  
│   ├── ui/                   \# Components ที่สร้างโดย shadcn/ui  
│   └── BookingDialog.tsx     \# Custom component สำหรับหน้าต่างการจอง  
├── prisma/  
│   ├── schema.prisma         \# ไฟล์กำหนด Schema ของฐานข้อมูล  
│   └── migrations/           \# โฟลเดอร์เก็บประวัติการแก้ไข DB  
└── .env                      \# ไฟล์เก็บ Environment Variables (เช่น DATABASE\_URL)

## **💾 Database Schema**

เราใช้ Prisma ในการจัดการ Schema ของฐานข้อมูล ซึ่งถูกกำหนดไว้ใน prisma/schema.prisma

// datasource, generator...

model Seat {  
  id    Int    @id @default(autoincrement())  
  row   Int  
  col   Int  
  label String // เช่น "A1", "A2"

  bookings Booking\[\]  
}

model Booking {  
  id       Int      @id @default(autoincrement())  
  seatId   Int  
  date     DateTime @db.Date  
  userName String

  seat Seat @relation(fields: [seatId], references: [id])  
  @@index([seatId, date])  
}

## **Endpoints (API)**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/seats | ดึงข้อมูลที่นั่งทั้งหมด |
| POST | /api/seats | สร้าง Layout ของที่นั่งใหม่ (สำหรับ Admin) |
| PUT | /api/seats/\[id\] | แก้ไข Label ของที่นั่ง |
| GET | /api/bookings?date=... | ดึงข้อมูลการจองสำหรับวันที่ระบุ |
| GET | /api/bookings?startDate=...\&endDate=... | ดึงข้อมูลการจองสำหรับช่วงวันที่ที่ระบุ (Report) |
| POST | /api/bookings | สร้างการจองใหม่ |
| PUT | /api/bookings/\[id\] | แก้ไขข้อมูลการจอง |
| DELETE | /api/bookings/\[id\] | ลบข้อมูลการจอง |

## **🚀 Getting Started (เริ่มต้นใช้งาน)**

ทำตามขั้นตอนต่อไปนี้เพื่อรันโปรเจกต์บนเครื่องของคุณ

### **Prerequisites**

* Node.js (v18.0 or later)  
* npm or yarn  
* PostgreSQL Database ที่ทำงานอยู่ (บนเครื่องหรือบน Cloud)

### **1\. Clone the repository**

git clone \<your-repository-url\>  
cd seat-booking-app

### **2\. Install dependencies**

npm install

### **3\. Setup environment variables**

สร้างไฟล์ .env ใน root directory ของโปรเจกต์ และใส่ Connection String ของ PostgreSQL Database ของคุณ

\# .env  
DATABASE\_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE\_NAME"

**Note:** หากใช้บริการ Cloud Database อย่าง Supabase, Neon, etc. ให้ใช้ **Direct Connection String** และอาจจะต้องเพิ่ม ?sslmode=require ต่อท้าย

### **4\. Run database migration**

คำสั่งนี้จะอ่าน prisma/schema.prisma และสร้างตารางที่จำเป็นในฐานข้อมูลของคุณ

npx prisma migrate dev

ตอบ y และตั้งชื่อ migration (เช่น "init")

### **5\. Start the development server**

npm run dev

เปิด Browser แล้วไปที่ [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

## **💡 Future Improvements (การพัฒนาต่อยอด)**

* **Authentication & Authorization:** เพิ่มระบบ Login (เช่นใช้ NextAuth.js) เพื่อจำกัดสิทธิ์การเข้าถึงหน้า Admin และผูกการจองกับ User ID  
* **Real-time Updates:** ใช้ WebSockets (เช่น socket.io หรือ Pusher) เพื่ออัปเดตสถานะที่นั่งให้ผู้ใช้ทุกคนเห็นทันทีโดยไม่ต้อง Refresh  
* **Email Notifications:** ส่งอีเมลยืนยันการจองหรือแจ้งเตือนเมื่อการจองใกล้ถึงเวลา  
* **Advanced Reporting:** เพิ่มกราฟและสถิติในหน้า Dashboard (เช่น ที่นั่งที่ถูกจองบ่อยที่สุด)  
* **Multi-room/Multi-venue Support:** ขยาย Schema ให้รองรับการจองในหลายๆ ห้องหรือสถานที่