import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class OwnCar {
  @PrimaryGeneratedColumn()
  OWN_CAR_ID: number;

  @ManyToOne(() => User, (user) => user.ownCars, { eager: false })
  @JoinColumn({ name: 'USER_ID' })
  user: User;

  @Column()
  OWN_CAR_TRIM_ID: string;

  @CreateDateColumn()
  OWN_CAR_CREATED_AT: Date;
}
