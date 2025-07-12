-- CreateTable
CREATE TABLE "procedures" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subprocesses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedNumberOfDays" INTEGER NOT NULL,
    "numberOfDaysBeforeDeadline" INTEGER,
    "roleOfThePersonInCharge" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isStepWithCost" BOOLEAN NOT NULL DEFAULT false,
    "procedureId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subprocesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subprocesses_procedureId_idx" ON "subprocesses"("procedureId");

-- AddForeignKey
ALTER TABLE "subprocesses" ADD CONSTRAINT "subprocesses_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
