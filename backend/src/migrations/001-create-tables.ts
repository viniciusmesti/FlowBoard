import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables0011703012345678 implements MigrationInterface {
    name = 'CreateTables0011703012345678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Habilitar extensão uuid-ossp se não existir
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Criar tabela users
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "name" character varying NOT NULL,
                "avatar" character varying DEFAULT 'user',
                "role" character varying DEFAULT 'user',
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f7898dd9cb9e9b7b3c" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela requirements
        await queryRunner.query(`
            CREATE TABLE "requirements" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "priority" character varying DEFAULT 'medium',
                "status" character varying DEFAULT 'draft',
                "type" character varying DEFAULT 'feature',
                "estimatedHours" integer,
                "actualHours" integer,
                "color" character varying DEFAULT 'bg-blue-500',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdById" uuid,
                "assignedToId" uuid,
                CONSTRAINT "PK_requirements_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela tasks (com todos os campos)
        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "status" character varying DEFAULT 'backlog',
                "priority" character varying DEFAULT 'medium',
                "estimatedHours" integer,
                "actualHours" integer,
                "startDate" date,
                "endDate" date,
                "budget" double precision,
                "progress" double precision DEFAULT 0,
                "dependencies" text DEFAULT '',
                "category" character varying,
                "tags" text DEFAULT '',
                "requirementId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "ownerId" uuid,
                "assigneeId" uuid,
                "templateId" uuid,
                CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela subtasks
        await queryRunner.query(`
            CREATE TABLE "subtasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "status" character varying DEFAULT 'todo',
                "priority" character varying DEFAULT 'medium',
                "estimatedHours" integer,
                "actualHours" integer,
                "isCompleted" boolean DEFAULT false,
                "taskId" uuid,
                "assignedToId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_subtasks_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela milestones
        await queryRunner.query(`
            CREATE TABLE "milestones" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "dueDate" TIMESTAMP,
                "status" character varying DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "requirementId" uuid,
                CONSTRAINT "PK_milestones_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela comments
        await queryRunner.query(`
            CREATE TABLE "comments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "taskId" uuid,
                "requirementId" uuid,
                CONSTRAINT "PK_comments_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela templates
        await queryRunner.query(`
            CREATE TABLE "templates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "content" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdById" uuid,
                CONSTRAINT "PK_templates_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela notifications
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "message" text NOT NULL,
                "type" character varying DEFAULT 'info',
                "isRead" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela activities
        await queryRunner.query(`
            CREATE TABLE "activities" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" character varying NOT NULL,
                "entityType" character varying NOT NULL,
                "entityId" uuid,
                "details" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "taskId" uuid,
                "requirementId" uuid,
                CONSTRAINT "PK_activities_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela attachments
        await queryRunner.query(`
            CREATE TABLE "attachments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "filename" character varying NOT NULL,
                "originalName" character varying NOT NULL,
                "mimeType" character varying NOT NULL,
                "size" integer NOT NULL,
                "path" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "taskId" uuid,
                "requirementId" uuid,
                CONSTRAINT "PK_attachments_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela requirement_comments
        await queryRunner.query(`
            CREATE TABLE "requirement_comments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "requirementId" uuid,
                CONSTRAINT "PK_requirement_comments_id" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela approval_requests
        await queryRunner.query(`
            CREATE TABLE "approval_requests" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" character varying DEFAULT 'pending',
                "comments" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "requirementId" uuid,
                "requestedById" uuid,
                "approvedById" uuid,
                CONSTRAINT "PK_approval_requests_id" PRIMARY KEY ("id")
            )
        `);

        // Adicionar foreign keys
        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_owner" 
            FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_assignee" 
            FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_requirement" 
            FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "subtasks" ADD CONSTRAINT "FK_subtasks_task" 
            FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "subtasks" ADD CONSTRAINT "FK_subtasks_assignee" 
            FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_user" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_task" 
            FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_user" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_task" 
            FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign keys primeiro
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_activities_task"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_activities_user"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_task"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_user"`);
        await queryRunner.query(`ALTER TABLE "subtasks" DROP CONSTRAINT "FK_subtasks_assignee"`);
        await queryRunner.query(`ALTER TABLE "subtasks" DROP CONSTRAINT "FK_subtasks_task"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_requirement"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_assignee"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_owner"`);

        // Remover tabelas na ordem inversa
        await queryRunner.query(`DROP TABLE "approval_requests"`);
        await queryRunner.query(`DROP TABLE "requirement_comments"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "templates"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "milestones"`);
        await queryRunner.query(`DROP TABLE "subtasks"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "requirements"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
