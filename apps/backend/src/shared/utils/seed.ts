import { DataSource } from 'typeorm';
import { Provider } from '../../features/pricing/entities/provider.entity';
import { Tariff } from '../../features/pricing/entities/tariff.entity';
import typeormConfig from '../config/typeorm.config';

async function seed() {
  const dataSource = await typeormConfig.initialize();
  
  const providerRepo = dataSource.getRepository(Provider);
  const tariffRepo = dataSource.getRepository(Tariff);

  console.log('Seeding database...');

  // Create PGE
  const pge = providerRepo.create({
    name: 'PGE',
    websiteUrl: 'https://www.gkpge.pl/',
  });
  await providerRepo.save(pge);

  // Create Tauron
  const tauron = providerRepo.create({
    name: 'Tauron',
    websiteUrl: 'https://www.tauron.pl/',
  });
  await providerRepo.save(tauron);

  // Create Tariffs for PGE
  const pgeG11 = tariffRepo.create({
    name: 'G11',
    pricePerKwh: 0.92,
    effectiveDate: new Date(),
    provider: pge,
  });
  await tariffRepo.save(pgeG11);

  const pgeG12 = tariffRepo.create({
    name: 'G12',
    pricePerKwh: 1.05,
    effectiveDate: new Date(),
    provider: pge,
  });
  await tariffRepo.save(pgeG12);

  console.log('Seed completed successfully!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
