import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('query_history')
export class QueryHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  queryType: string; // e.g., "comparison"

  @Column('jsonb')
  parameters: any; // User inputs like kwh, duration

  @Column('jsonb')
  results: any; // Comparison results

  @Column({ nullable: true })
  userId: string; // Optional user identifier

  @CreateDateColumn()
  createdAt: Date;
}
