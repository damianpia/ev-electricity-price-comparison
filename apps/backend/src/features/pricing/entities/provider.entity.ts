import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Tariff } from './tariff.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., "PGE", "Tauron", "Energa"

  @Column({ nullable: true })
  websiteUrl: string;

  @OneToMany(() => Tariff, (tariff) => tariff.provider)
  tariffs: Tariff[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
