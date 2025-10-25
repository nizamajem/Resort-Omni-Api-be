import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResortAccountRole1720000000000 implements MigrationInterface {
  name = 'AddResortAccountRole1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resort_accounts" ADD COLUMN "role" character varying(30) NOT NULL DEFAULT 'resort'`,
    );
    await queryRunner.query(
      `UPDATE "resort_accounts" SET "role" = 'resort' WHERE "role" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resort_accounts" DROP COLUMN "role"`);
  }
}
