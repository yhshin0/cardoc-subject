import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  USER_ID: number;

  @Column({ unique: true })
  USER_USER_ID: string;

  @Column()
  USER_PASSWORD: string;

  @CreateDateColumn()
  USER_CREATED_AT: Date;
}
