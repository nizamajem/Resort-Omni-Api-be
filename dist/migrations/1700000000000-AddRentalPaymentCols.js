"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRentalPaymentCols1700000000000 = void 0;
class AddRentalPaymentCols1700000000000 {
    constructor() {
        this.name = 'AddRentalPaymentCols1700000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "rentals" ADD COLUMN IF NOT EXISTS "paymentOrderId" varchar(200)`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD COLUMN IF NOT EXISTS "paymentType" varchar(50)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN IF EXISTS "paymentType"`);
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN IF EXISTS "paymentOrderId"`);
    }
}
exports.AddRentalPaymentCols1700000000000 = AddRentalPaymentCols1700000000000;
//# sourceMappingURL=1700000000000-AddRentalPaymentCols.js.map