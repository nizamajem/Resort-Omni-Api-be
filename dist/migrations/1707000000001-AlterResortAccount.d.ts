import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AlterResortAccount1707000000001 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
