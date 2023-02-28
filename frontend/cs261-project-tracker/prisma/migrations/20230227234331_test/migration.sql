-- CreateTable
CREATE TABLE "morale" (
    "project" INTEGER NOT NULL,
    "u_id" INTEGER NOT NULL,
    "submit_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "morale" INTEGER NOT NULL,

    CONSTRAINT "morale_pkey" PRIMARY KEY ("project","u_id","submit_date","morale")
);

-- CreateTable
CREATE TABLE "project_developers" (
    "project" INTEGER NOT NULL,
    "u_id" INTEGER NOT NULL,
    "ismanager" BOOLEAN NOT NULL,

    CONSTRAINT "project_developers_pkey" PRIMARY KEY ("project","u_id")
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" SERIAL NOT NULL,
    "project" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "deadline" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "progress" VARCHAR(100) NOT NULL,
    "risk" INTEGER NOT NULL,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "deadline" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "budget" INTEGER NOT NULL,
    "risk" INTEGER NOT NULL,
    "repository_link" VARCHAR(500) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invites" (
    "project" INTEGER NOT NULL,
    "u_id" INTEGER NOT NULL,

    CONSTRAINT "user_invites_pkey" PRIMARY KEY ("project","u_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "forename" VARCHAR(100) NOT NULL,
    "surname" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "years_experience" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tasks" (
    "task" INTEGER NOT NULL,
    "u_id" INTEGER NOT NULL,

    CONSTRAINT "user_tasks_pkey" PRIMARY KEY ("task","u_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "morale" ADD CONSTRAINT "morale_project_fkey" FOREIGN KEY ("project") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "morale" ADD CONSTRAINT "morale_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_developers" ADD CONSTRAINT "project_developers_project_fkey" FOREIGN KEY ("project") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_developers" ADD CONSTRAINT "project_developers_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_fkey" FOREIGN KEY ("project") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_project_fkey" FOREIGN KEY ("project") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_task_fkey" FOREIGN KEY ("task") REFERENCES "project_tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
