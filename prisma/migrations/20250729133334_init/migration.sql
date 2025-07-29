-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."CustomerSource" AS ENUM ('WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'INTRODUCER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SourceRequest" AS ENUM ('CUSTOMER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MaterialType" AS ENUM ('INGREDIENT', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('REQUEST');

-- CreateEnum
CREATE TYPE "public"."StatusSubprocessHistory" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "avatar" TEXT,
    "password" TEXT NOT NULL,
    "isVerifiedAccount" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDate" TIMESTAMP(3),
    "verifiedToken" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "lastLoginDate" TIMESTAMP(3),
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("userId","token")
);

-- CreateTable
CREATE TABLE "public"."reset_password_tokens" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reset_password_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."status_products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL,
    "procedureId" INTEGER NOT NULL,
    "procedureHistoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "source" "public"."CustomerSource" NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" INTEGER NOT NULL,
    "statusProductId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."procedures" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subprocesses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedNumberOfDays" INTEGER NOT NULL,
    "numberOfDaysBeforeDeadline" INTEGER,
    "roleOfThePersonInCharge" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isStepWithCost" BOOLEAN NOT NULL DEFAULT false,
    "step" INTEGER NOT NULL,
    "procedureId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subprocesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."procedures_history" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subprocesses_history" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedNumberOfDays" INTEGER NOT NULL,
    "numberOfDaysBeforeDeadline" INTEGER,
    "roleOfThePersonInCharge" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isStepWithCost" BOOLEAN NOT NULL DEFAULT false,
    "step" INTEGER NOT NULL,
    "procedureHistoryId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "price" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "public"."StatusSubprocessHistory" NOT NULL DEFAULT 'PENDING',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subprocesses_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."source_others" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "specifically" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_others_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."request_materials" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."requests" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "productLink" TEXT[],
    "media" TEXT[],
    "source" "public"."SourceRequest" NOT NULL,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" INTEGER,
    "customerId" INTEGER,
    "sourceOtherId" INTEGER,
    "statusProductId" INTEGER,
    "procedureHistoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."origins" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "origins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."materials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "public"."MaterialType" NOT NULL DEFAULT 'INGREDIENT',
    "originId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_admins" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."request_inputs" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER,
    "expectedDate" TIMESTAMP(3),
    "supplier" TEXT,
    "sourceCountry" TEXT,
    "price" INTEGER,
    "reason" TEXT,
    "materialId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evaluates" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "requestId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "public"."users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "public"."users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_userName_idx" ON "public"."users"("userName");

-- CreateIndex
CREATE INDEX "users_phoneNumber_idx" ON "public"."users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "public"."users"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_userId_key" ON "public"."user_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "public"."user_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_tokens_token_key" ON "public"."reset_password_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "public"."departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_headId_key" ON "public"."departments"("headId");

-- CreateIndex
CREATE INDEX "departments_headId_idx" ON "public"."departments"("headId");

-- CreateIndex
CREATE UNIQUE INDEX "status_products_name_key" ON "public"."status_products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phoneNumber_key" ON "public"."customers"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "public"."customers"("email");

-- CreateIndex
CREATE INDEX "customers_userId_idx" ON "public"."customers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "public"."categories"("name");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "public"."products"("categoryId");

-- CreateIndex
CREATE INDEX "subprocesses_procedureId_idx" ON "public"."subprocesses"("procedureId");

-- CreateIndex
CREATE INDEX "subprocesses_departmentId_idx" ON "public"."subprocesses"("departmentId");

-- CreateIndex
CREATE INDEX "subprocesses_history_procedureHistoryId_idx" ON "public"."subprocesses_history"("procedureHistoryId");

-- CreateIndex
CREATE INDEX "subprocesses_history_departmentId_idx" ON "public"."subprocesses_history"("departmentId");

-- CreateIndex
CREATE INDEX "subprocesses_history_userId_idx" ON "public"."subprocesses_history"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "request_materials_requestId_materialId_key" ON "public"."request_materials"("requestId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "requests_procedureHistoryId_key" ON "public"."requests"("procedureHistoryId");

-- CreateIndex
CREATE INDEX "requests_customerId_idx" ON "public"."requests"("customerId");

-- CreateIndex
CREATE INDEX "requests_sourceOtherId_idx" ON "public"."requests"("sourceOtherId");

-- CreateIndex
CREATE INDEX "requests_statusProductId_idx" ON "public"."requests"("statusProductId");

-- CreateIndex
CREATE UNIQUE INDEX "origins_name_key" ON "public"."origins"("name");

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "public"."materials"("code");

-- CreateIndex
CREATE UNIQUE INDEX "request_inputs_materialId_key" ON "public"."request_inputs"("materialId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reset_password_tokens" ADD CONSTRAINT "reset_password_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_headId_fkey" FOREIGN KEY ("headId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."status_products" ADD CONSTRAINT "status_products_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "public"."procedures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."status_products" ADD CONSTRAINT "status_products_procedureHistoryId_fkey" FOREIGN KEY ("procedureHistoryId") REFERENCES "public"."procedures_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_statusProductId_fkey" FOREIGN KEY ("statusProductId") REFERENCES "public"."status_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subprocesses" ADD CONSTRAINT "subprocesses_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "public"."procedures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subprocesses" ADD CONSTRAINT "subprocesses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subprocesses_history" ADD CONSTRAINT "subprocesses_history_procedureHistoryId_fkey" FOREIGN KEY ("procedureHistoryId") REFERENCES "public"."procedures_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subprocesses_history" ADD CONSTRAINT "subprocesses_history_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subprocesses_history" ADD CONSTRAINT "subprocesses_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_materials" ADD CONSTRAINT "request_materials_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_materials" ADD CONSTRAINT "request_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_sourceOtherId_fkey" FOREIGN KEY ("sourceOtherId") REFERENCES "public"."source_others"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_statusProductId_fkey" FOREIGN KEY ("statusProductId") REFERENCES "public"."status_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_procedureHistoryId_fkey" FOREIGN KEY ("procedureHistoryId") REFERENCES "public"."procedures_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."materials" ADD CONSTRAINT "materials_originId_fkey" FOREIGN KEY ("originId") REFERENCES "public"."origins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_inputs" ADD CONSTRAINT "request_inputs_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluates" ADD CONSTRAINT "evaluates_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluates" ADD CONSTRAINT "evaluates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
