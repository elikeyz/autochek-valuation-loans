import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity()
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (v) => v.valuations, { eager: true })
  vehicle: Vehicle;

  @Column('float')
  estimatedValue: number;

  @Column({ default: 'simulated' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;
}
