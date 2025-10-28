import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendPackageAccountPkgColumn1725000001000 implements MigrationInterface {
  name = "ExtendPackageAccountPkgColumn1725000001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "package_accounts" ALTER COLUMN "pkg" TYPE character varying(64)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "package_accounts" ALTER COLUMN "pkg" TYPE character varying(20)`);
  }
}

