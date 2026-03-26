import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettingsTable1774548583726 implements MigrationInterface {
    name = 'AddSettingsTable1774548583726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "settings" ("key" character varying NOT NULL, "value" text NOT NULL, "description" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c8639b7626fa94ba8265628f214" PRIMARY KEY ("key"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "settings"`);
    }

}
