import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('charging_sessions')
export class ChargingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  externalId: number; // ID from TeslaMate charging_processes table

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column('decimal', { precision: 10, scale: 4 })
  kwhAdded: number;

  @Column({ default: false })
  isHome: boolean;

  @Column({ nullable: true })
  locationName: string;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  costFixed: number;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  costDynamic: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
