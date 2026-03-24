import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('geofences')
export class TeslaMateGeofence {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}

@Entity('charging_processes')
export class TeslaMateChargingProcess {
  @PrimaryColumn()
  id: number;

  @Column('timestamp')
  start_date: Date;

  @Column('timestamp', { nullable: true })
  end_date: Date;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  charge_energy_added: number;

  @Column({ nullable: true })
  geofence_id: number;

  @ManyToOne(() => TeslaMateGeofence)
  @JoinColumn({ name: 'geofence_id' })
  geofence: TeslaMateGeofence;
}
