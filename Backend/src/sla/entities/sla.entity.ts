import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Sla {

  @PrimaryGeneratedColumn()
  id: number; // SLA id

  @Column()
  priority: string; // LOW / MEDIUM / HIGH

  @Column()
  responseTime: number; // minutes or hours

  @Column()
  resolutionTime: number; // resolution limit
}