"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSettings1706000000000 = void 0;
class AddSettings1706000000000 {
    constructor() {
        this.name = 'AddSettings1706000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key" varchar(100) NOT NULL,
        "value" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_settings_key" ON "settings" ("key")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_settings_key"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);
    }
}
exports.AddSettings1706000000000 = AddSettings1706000000000;
//# sourceMappingURL=1706000000000-AddSettings.js.map