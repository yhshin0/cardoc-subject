import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OwnCar } from '../../own-cars/entities/own-car.entity';

@Entity()
export class Tire {
  @PrimaryGeneratedColumn()
  TIRE_ID: number;

  @Column()
  TIRE_WIDTH: number;

  @Column()
  TIRE_ASPECT_RATIO: number;

  @Column()
  TIRE_WHEEL_SIZE: number;

  @CreateDateColumn()
  TIRE_CREATED_AT: Date;

  @OneToOne(() => OwnCar)
  @JoinColumn({ name: 'OWN_CAR_ID' })
  ownCar: OwnCar;
}
