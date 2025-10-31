import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Valuation } from '../valuations/valuation.entity';
import { Offer } from '../offers/offer.entity';

export type LoanStatus = 'pending_review' | 'approved' | 'rejected';

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

  @Column({ default: 'pending_review' })
  status: LoanStatus;

  @ManyToOne(() => Offer, (offer) => offer.loans, { eager: true })
  offer: Offer;

  @Column('text', { nullable: true })
  reviewNotes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  reviewedAt?: Date;
}
