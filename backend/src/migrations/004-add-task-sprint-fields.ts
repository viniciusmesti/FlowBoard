import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskSprintFields0041704000000001 implements MigrationInterface {
    name = 'AddTaskSprintFields0041704000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionar campos de sprint e user story na tabela tasks
        await queryRunner.query(`
            ALTER TABLE "tasks" 
            ADD COLUMN IF NOT EXISTS "userStory" text,
            ADD COLUMN IF NOT EXISTS "currentSprint" character varying,
            ADD COLUMN IF NOT EXISTS "sprintGoal" text
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover colunas adicionadas
        await queryRunner.query(`
            ALTER TABLE "tasks" 
            DROP COLUMN IF EXISTS "userStory",
            DROP COLUMN IF EXISTS "currentSprint",
            DROP COLUMN IF EXISTS "sprintGoal"
        `);
    }
}


