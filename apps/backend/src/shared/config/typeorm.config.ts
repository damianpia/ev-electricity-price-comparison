import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables with override: true
config({ path: join(process.cwd(), '.env'), override: true });
config({ path: join(process.cwd(), 'apps/backend/.env'), override: true });
config({ path: join(process.cwd(), '../../.env'), override: true });
config({ path: join(process.cwd(), '../.env'), override: true });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '../../../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../../migrations/*{.ts,.js}')],
  synchronize: false,
});
