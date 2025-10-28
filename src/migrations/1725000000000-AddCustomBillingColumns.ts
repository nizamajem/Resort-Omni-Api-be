import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomBillingColumns1725000000000 implements MigrationInterface {
  name = "AddCustomBillingColumns1725000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rentals" ADD "billingMode" character varying(20) NOT NULL DEFAULT 'standard'`);
    await queryRunner.query(`ALTER TABLE "rentals" ADD "customPackageId" character varying(64)`);
    await queryRunner.query(`ALTER TABLE "rentals" ADD "customBlockMinutes" integer`);
    await queryRunner.query(`ALTER TABLE "rentals" ADD "customBlockRate" integer`);
    await queryRunner.query(`ALTER TABLE "rentals" ADD "customBlocksUsed" integer`);
    await queryRunner.query(`ALTER TABLE "rentals" ADD "customElapsedMinutes" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customElapsedMinutes"`);
    await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customBlocksUsed"`);
    await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customBlockRate"`);
    await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customBlockMinutes"`);
    await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customPackageId"`);
    await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "billingMode"`);
  }
}

