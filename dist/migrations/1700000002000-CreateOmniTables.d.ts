import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateOmniTables1700000002000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
