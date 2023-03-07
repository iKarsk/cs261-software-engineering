/*
  Warnings:

  - The primary key for the `morale` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `ismanager` to the `user_invites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "morale" DROP CONSTRAINT "morale_pkey",
ALTER COLUMN "submit_date" SET DATA TYPE DATE,
ADD CONSTRAINT "morale_pkey" PRIMARY KEY ("project", "u_id", "submit_date", "morale");

-- AlterTable
ALTER TABLE "project_tasks" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "start_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "deadline" SET DATA TYPE DATE,
ALTER COLUMN "end_date" DROP NOT NULL,
ALTER COLUMN "end_date" SET DATA TYPE DATE,
ALTER COLUMN "progress" DROP NOT NULL,
ALTER COLUMN "risk" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "deadline" SET DATA TYPE DATE,
ALTER COLUMN "end_date" DROP NOT NULL,
ALTER COLUMN "end_date" SET DATA TYPE DATE,
ALTER COLUMN "risk" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_invites" ADD COLUMN     "ismanager" BOOLEAN NOT NULL;
