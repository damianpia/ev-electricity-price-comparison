import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Provider } from './provider.entity';

@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "G11", "G12"

  @Column('decimal', { precision: 10, scale: 4 })
  pricePerKwh: number; // Net price per kWh

  @Column('timestamp')
  effectiveDate: Date; // Date from which the tariff is effective

  @ManyToOne(() => Provider, (provider) => provider.tariffs)
  provider: Provider;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
