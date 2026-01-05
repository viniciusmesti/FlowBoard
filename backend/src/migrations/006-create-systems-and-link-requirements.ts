import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSystemsAndLinkRequirements0061705000000001 implements MigrationInterface {
    name = 'CreateSystemsAndLinkRequirements0061705000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela systems
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "systems" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "color" character varying NOT NULL,
                "ownerId" uuid NOT NULL,
                "requirementTypes" text DEFAULT '',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_systems_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_systems_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // Adicionar índices
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_systems_owner" ON "systems" ("ownerId")
        `);

        // Adicionar campos systemId e requirementType na tabela requirements
        await queryRunner.query(`
            ALTER TABLE "requirements" 
            ADD COLUMN IF NOT EXISTS "systemId" uuid,
            ADD COLUMN IF NOT EXISTS "requirementType" character varying
        `);

        // Adicionar foreign key para systemId
        await queryRunner.query(`
            ALTER TABLE "requirements" 
            ADD CONSTRAINT "FK_requirements_system" 
            FOREIGN KEY ("systemId") REFERENCES "systems"("id") ON DELETE CASCADE
        `);

        // Adicionar índice para systemId
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_requirements_systemId" ON "requirements" ("systemId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_requirements_systemId"
        `);

        // Remover foreign key
        await queryRunner.query(`
            ALTER TABLE "requirements" 
            DROP CONSTRAINT IF EXISTS "FK_requirements_system"
        `);

        // Remover colunas de requirements
        await queryRunner.query(`
            ALTER TABLE "requirements" 
            DROP COLUMN IF EXISTS "systemId",
            DROP COLUMN IF EXISTS "requirementType"
        `);

        // Remover índice de systems
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_systems_owner"
        `);

        // Remover tabela systems
        await queryRunner.query(`
            DROP TABLE IF EXISTS "systems"
        `);
    }
}

