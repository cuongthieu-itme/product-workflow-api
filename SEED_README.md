# Database Seed

## Mô tả

Hệ thống seed được tổ chức thành các file riêng biệt:

- `prisma/seed/department.seed.ts` - Seed cho departments
- `prisma/seed/user.seed.ts` - Seed cho users
- `prisma/seed/index.ts` - File chính orchestrate

Tạo dữ liệu mẫu:

- 1 Department: "Quản lý" (độc lập)
- 1 User: Super Admin (độc lập, không liên kết department)

## Cách sử dụng

### 1. Chạy seed

```bash
npm run seed
```

### 2. Hoặc sử dụng Prisma directly

```bash
npx prisma db seed
```

### 3. Reset database và seed lại

```bash
npx prisma migrate reset
```

## Thông tin đăng nhập

Sau khi seed thành công, bạn có thể đăng nhập với:

**Super Admin:**

- Username: `admin`
- Email: `admin@company.com`
- Password: `Admin@123`

## Cấu trúc dữ liệu tạo

### Department

- Name: "Quản lý"
- Description: "Phòng ban quản lý công ty"

### User

- Full Name: "Super Admin"
- Username: "admin"
- Email: "admin@company.com"
- Phone: "0901234567"
- Role: SUPER_ADMIN
- Verified: true
- Department: null (không liên kết)

## Cấu trúc Files

```
prisma/seed/
├── index.ts              # File chính orchestrate
├── department.seed.ts    # Seed departments
└── user.seed.ts          # Seed users
```

## Ghi chú

- File seed sử dụng `upsert` nên có thể chạy nhiều lần mà không bị duplicate
- Password được hash bằng bcrypt với salt rounds = 10
- User và Department được tạo độc lập, không có quan hệ
- Cấu trúc modular giúp dễ mở rộng và maintain
