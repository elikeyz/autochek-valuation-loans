import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Valuation } from '../valuations/valuation.entity';
import { Offer } from '../offers/offer.entity';

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'funded' | 'cancelled';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicantName: string;

  @Column('float')
  applicantIncome: number;

  @Column('float')
  applicantMonthlyDebt: number;

  @Column('float')
  amountRequested: number;

  @Column('int')
  termMonths: number;

  @Column('float')
  interestRate: number;

  @Column({ default: 'pending' })
  status: LoanStatus;

  @OneToOne(() => Vehicle, { eager: true })
  @JoinColumn()
  vehicle: Vehicle;

  @OneToOne(() => Valuation, { eager: true })
  @JoinColumn()
  valuation: Valuation;

  @OneToMany(() => Offer, (offer) => offer.loan, { eager: true })
  offers: Offer[];

  @CreateDateColumn()
  createdAt: Date;
}
