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

  @OneToMany(() => OwnCar, (ownCar) => ownCar.OWN_CAR_ID, { eager: false })
  ownCars: OwnCar[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.USER_PASSWORD = await bcrypt.hash(
        this.USER_PASSWORD,
        USER_CONSTANTS.SALT_ROUND,
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
