import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity()
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Vehicle, (v) => v.valuation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ nullable: true })
  vehicleId: string;

  @Column('float')
  estimatedValue: number;

  @Column({ default: 'simulated' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
