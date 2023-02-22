-- CreateTable
CREATE TABLE "project_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project" BIGINT,
    "name" TEXT,
    "description" TEXT,
    "start_date" DATETIME,
    "deadline" DATETIME,
    "end_date" DATETIME,
    "progress" TEXT,
    "risk" INTEGER
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "forename" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "years_experience" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
