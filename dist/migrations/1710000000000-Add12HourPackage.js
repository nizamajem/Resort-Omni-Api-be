"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Add12HourPackage1710000000000 = void 0;
class Add12HourPackage1710000000000 {
    constructor() {
        this.name = 'Add12HourPackage1710000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      UPDATE "settings"
      SET "value" = jsonb_set(
        jsonb_set(
          "value",
          '{packages,12h}',
          to_jsonb(true),
          true
        ),
        '{packagePrices,12h}',
        to_jsonb(180000),
        true
      )
      WHERE "key" = 'feature_flags'
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      UPDATE "settings"
      SET "value" = "value" #- '{packages,12h}' #- '{packagePrices,12h}'
      WHERE "key" = 'feature_flags'
    `);
    }
}
exports.Add12HourPackage1710000000000 = Add12HourPackage1710000000000;
