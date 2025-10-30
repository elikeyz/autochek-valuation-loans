import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Valuation } from '../valuations/valuation.entity';
import { Loan } from '../loans/loan.entity';

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

  @OneToMany(() => Valuation, (v) => v.vehicle)
  valuations: Valuation[];

  @OneToMany(() => Loan, (l) => l.vehicle)
  loans: Loan[];
}
