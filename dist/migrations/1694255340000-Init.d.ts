import { MigrationInterface, QueryRunner } from "typeorm";
export declare class Init1694255340000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
