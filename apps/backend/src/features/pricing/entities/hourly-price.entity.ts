import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('hourly_prices')
@Unique(['date', 'hour'])
export class HourlyPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date')
  date: string; // ISO format: YYYY-MM-DD

  @Column('integer')
  hour: number; // 0-23

  @Column('decimal', { precision: 10, scale: 4 })
  pricePerMwh: number; // Price in PLN/MWh (TGE standard)

  @Column('decimal', { precision: 10, scale: 4 })
  pricePerKwh: number; // Calculated Price in PLN/kWh

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
