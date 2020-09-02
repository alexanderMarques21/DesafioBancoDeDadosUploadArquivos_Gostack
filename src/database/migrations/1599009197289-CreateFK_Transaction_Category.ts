import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class CreateFKTransactionCategory1593271369020
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        name: 'fk_transactions_category',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'transactions',
      'fk_transactions_category',
    );
  }
}
