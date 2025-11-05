import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSprintFields1729447000000 implements MigrationInterface {
  name = 'AddSprintFields1729447000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna currentSprint
    await queryRunner.addColumn(
      'requirements',
      new TableColumn({
        name: 'currentSprint',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Adicionar coluna lastCompletedSprint
    await queryRunner.addColumn(
      'requirements',
      new TableColumn({
        name: 'lastCompletedSprint',
        type: 'varchar',
        isNullable: true,
      })
    );

    console.log('✓ Sprint fields added to requirements table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna lastCompletedSprint
    await queryRunner.dropColumn('requirements', 'lastCompletedSprint');

    // Remover coluna currentSprint
    await queryRunner.dropColumn('requirements', 'currentSprint');

    console.log('✓ Sprint fields removed from requirements table');
  }
}



