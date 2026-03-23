import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1774294818580 implements MigrationInterface {
    name = 'InitialMigration1774294818580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "query_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "queryType" character varying NOT NULL, "parameters" jsonb NOT NULL, "results" jsonb NOT NULL, "userId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d14e08569f855cccc762004f7d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "providers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "websiteUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d735474e539e674ba3702eddc44" UNIQUE ("name"), CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD "providerId" uuid`);
        await queryRunner.query(`ALTER TABLE "tariffs" ADD CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tariffs" DROP CONSTRAINT "FK_faf1cd4e78267b4d61f22cc09cd"`);
        await queryRunner.query(`ALTER TABLE "tariffs" DROP COLUMN "providerId"`);
        await queryRunner.query(`DROP TABLE "providers"`);
        await queryRunner.query(`DROP TABLE "query_history"`);
    }

}
