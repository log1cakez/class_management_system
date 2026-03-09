-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."BehaviorType" AS ENUM ('INDIVIDUAL', 'GROUP_WORK');

-- CreateTable
CREATE TABLE "public"."behaviors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "behaviorType" "public"."BehaviorType" NOT NULL DEFAULT 'INDIVIDUAL',
    "praise" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "behaviors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teachers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_shares" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."points" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "behaviorId" TEXT,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "behaviorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_works" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupWorkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_students" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_work_behaviors" (
    "id" TEXT NOT NULL,
    "groupWorkId" TEXT NOT NULL,
    "behaviorId" TEXT NOT NULL,
    "praise" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_work_behaviors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_work_awards" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "behaviorId" TEXT,
    "points" INTEGER NOT NULL,
    "praise" TEXT NOT NULL,
    "badgeId" TEXT,
    "badgeName" TEXT,
    "awardedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_work_awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "behaviors_name_teacherId_key" ON "public"."behaviors"("name", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "public"."teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "class_shares_classId_sharedWithId_key" ON "public"."class_shares"("classId", "sharedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "group_students_groupId_studentId_key" ON "public"."group_students"("groupId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "group_work_behaviors_groupWorkId_behaviorId_key" ON "public"."group_work_behaviors"("groupWorkId", "behaviorId");

-- AddForeignKey
ALTER TABLE "public"."behaviors" ADD CONSTRAINT "behaviors_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_shares" ADD CONSTRAINT "class_shares_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_shares" ADD CONSTRAINT "class_shares_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_shares" ADD CONSTRAINT "class_shares_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."points" ADD CONSTRAINT "points_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."points" ADD CONSTRAINT "points_behaviorId_fkey" FOREIGN KEY ("behaviorId") REFERENCES "public"."behaviors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_works" ADD CONSTRAINT "group_works_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_works" ADD CONSTRAINT "group_works_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_groupWorkId_fkey" FOREIGN KEY ("groupWorkId") REFERENCES "public"."group_works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_students" ADD CONSTRAINT "group_students_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_students" ADD CONSTRAINT "group_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_work_behaviors" ADD CONSTRAINT "group_work_behaviors_groupWorkId_fkey" FOREIGN KEY ("groupWorkId") REFERENCES "public"."group_works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_work_behaviors" ADD CONSTRAINT "group_work_behaviors_behaviorId_fkey" FOREIGN KEY ("behaviorId") REFERENCES "public"."behaviors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_work_awards" ADD CONSTRAINT "group_work_awards_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_work_awards" ADD CONSTRAINT "group_work_awards_behaviorId_fkey" FOREIGN KEY ("behaviorId") REFERENCES "public"."behaviors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

