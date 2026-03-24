import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHourlyPrices1774376202088 implements MigrationInterface {
    name = 'AddHourlyPrices1774376202088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tariffs" DROP CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd"`);
        await queryRunner.query(`CREATE TABLE "hourly_prices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "hour" integer NOT NULL, "pricePerMwh" numeric(10,4) NOT NULL, "pricePerKwh" numeric(10,4) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_50f686085c82ca68fcf5e2e52bc" UNIQUE ("date", "hour"), CONSTRAINT "PK_42e88565c58a340605bcb641ad7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tariffs" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD "providerId" uuid`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tariffs" DROP CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd"`);
        await queryRunner.query(`ALTER TABLE "tariffs" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD "providerId" uuid`);
        await queryRunner.query(`DROP TABLE "hourly_prices"`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
