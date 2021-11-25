import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { USER_CONSTANTS } from '../constants/users.constants';
import { OwnCar } from '../../own-cars/entities/own-car.entity';

@Entity({ name: 'USER' })
export class User {
  @PrimaryGeneratedColumn({ name: 'USER_ID' })
  id: number;

  @Column({ unique: true, name: 'USER_USER_ID' })
  userId: string;

  @Column({ name: 'USER_PASSWORD' })
  password: string;

  @CreateDateColumn({ name: 'USER_CREATED_AT' })
  createdAt: Date;

  @OneToMany(() => OwnCar, (ownCar) => ownCar.id, { eager: false })
  ownCars: OwnCar[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(
        this.password,
        USER_CONSTANTS.SALT_ROUND,
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
