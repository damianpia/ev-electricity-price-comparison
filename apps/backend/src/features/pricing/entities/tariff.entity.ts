import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
