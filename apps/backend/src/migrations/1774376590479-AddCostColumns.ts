import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCostColumns1774376590479 implements MigrationInterface {
    name = 'AddCostColumns1774376590479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tariffs" DROP CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd"`);
        await queryRunner.query(`ALTER TABLE "charging_sessions" DROP COLUMN "totalCost"`);
        await queryRunner.query(`ALTER TABLE "tariffs" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD "providerId" uuid`);
        await queryRunner.query(`ALTER TABLE "charging_sessions" ADD "costFixed" numeric(10,4)`);
        await queryRunner.query(`ALTER TABLE "charging_sessions" ADD "costDynamic" numeric(10,4)`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tariffs" DROP CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd"`);
        await queryRunner.query(`ALTER TABLE "charging_sessions" DROP COLUMN "costDynamic"`);
        await queryRunner.query(`ALTER TABLE "charging_sessions" DROP COLUMN "costFixed"`);
        await queryRunner.query(`ALTER TABLE "tariffs" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD "providerId" uuid`);
        await queryRunner.query(`ALTER TABLE "charging_sessions" ADD "totalCost" numeric(10,4)`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
