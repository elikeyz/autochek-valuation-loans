import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Loan } from '../loans/loan.entity';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.offers)
  vehicle: Vehicle;

  @Column('float')
  amount: number;

  @Column('int')
  termMonths: number;

  @Column('float')
  monthlyPayment: number;

  @Column('float')
  apr: number;

  @Column({ default: 'active' })
  status: 'active' | 'inactive';

  @OneToMany(() => Loan, (loan) => loan.offer)
  loans: Loan[];

  @CreateDateColumn()
  createdAt: Date;
}
