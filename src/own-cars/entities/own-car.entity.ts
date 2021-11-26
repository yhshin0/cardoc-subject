import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity({ name: 'OWN_CAR' })
export class OwnCar {
  @PrimaryGeneratedColumn({ name: 'OWN_CAR_ID' })
  id: number;

  @Column({ name: 'OWN_CAR_TRIM_ID' })
  trimId: number;

  @CreateDateColumn({ name: 'OWN_CAR_CREATED_AT' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.ownCars, { eager: false })
  @JoinColumn({ name: 'USER_ID' })
  user: User;
}
