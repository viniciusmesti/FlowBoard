import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRequirementsTable1703012345679 implements MigrationInterface {
    name = 'FixRequirementsTable1703012345679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionar colunas que estão faltando na tabela requirements
        await queryRunner.query(`
            ALTER TABLE "requirements" 
            ADD COLUMN IF NOT EXISTS "ownerId" uuid,
            ADD COLUMN IF NOT EXISTS "approvalRequired" boolean DEFAULT false
        `);

        // Adicionar foreign key para owner se não existir
        await queryRunner.query(`
            ALTER TABLE "requirements" 
            ADD CONSTRAINT "FK_requirements_owner" 
            FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        // Corrigir colunas que podem estar com nomes diferentes
        await queryRunner.query(`
            ALTER TABLE "requirements" 
            ALTER COLUMN "dependencies" TYPE text DEFAULT '',
            ALTER COLUMN "tags" TYPE text DEFAULT ''
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign key
        await queryRunner.query(`ALTER TABLE "requirements" DROP CONSTRAINT "FK_requirements_owner"`);
        
        // Remover colunas adicionadas
        await queryRunner.query(`
            ALTER TABLE "requirements" 
            DROP COLUMN IF EXISTS "ownerId",
            DROP COLUMN IF EXISTS "approvalRequired"
        `);
    }
}
