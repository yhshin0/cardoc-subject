import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { USER_CONSTANTS } from '../constants/users.constants';
import { InternalServerErrorException } from '@nestjs/common';

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

  @BeforeInsert()
  async hashPassword() {
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
