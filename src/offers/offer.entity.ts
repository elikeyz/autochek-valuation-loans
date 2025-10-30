import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Loan } from '../loans/loan.entity';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Loan, (l) => l.offers)
  loan: Loan;

  @Column('float')
  monthlyPayment: number;

  @Column('float')
  apr: number;

  @Column({ default: 'generated' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;
}
