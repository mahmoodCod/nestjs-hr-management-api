import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Candidate entity
 * Stores information of a person applying for a job
 */
@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;
}
