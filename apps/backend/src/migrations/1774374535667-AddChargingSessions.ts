import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChargingSessions1774374535667 implements MigrationInterface {
    name = 'AddChargingSessions1774374535667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tariffs" DROP CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd"`);
        await queryRunner.query(`CREATE TABLE "charging_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "externalId" integer, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "kwhAdded" numeric(10,4) NOT NULL, "isHome" boolean NOT NULL DEFAULT false, "locationName" character varying, "totalCost" numeric(10,4), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6377ba54c75e0e6cad037cc3eec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tariffs" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD "providerId" uuid`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tariffs" DROP CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd"`);
        await queryRunner.query(`ALTER TABLE "tariffs" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD "providerId" uuid`);
        await queryRunner.query(`DROP TABLE "charging_sessions"`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
