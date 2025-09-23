import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddRentalCredentialPassword1700000001001 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
