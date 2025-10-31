import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Valuation } from '../valuations/valuation.entity';
import { Loan } from '../loans/loan.entity';
import { Offer } from '../offers/offer.entity';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  vin: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('int')
  mileage: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Valuation, (v) => v.vehicle, { eager: true })
  valuation: Valuation;

  @OneToMany(() => Offer, (o) => o.vehicle)
  offers: Offer[];
}
