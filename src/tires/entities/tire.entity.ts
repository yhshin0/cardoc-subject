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
  TIRE_FRONT_WIDTH: number;

  @Column()
  TIRE_FRONT_ASPECT_RATIO: number;

  @Column()
  TIRE_FRONT_WHEEL_SIZE: number;

  @Column()
  TIRE_REAR_WIDTH: number;

  @Column()
  TIRE_REAR_ASPECT_RATIO: number;

  @Column()
  TIRE_REAR_WHEEL_SIZE: number;

  @CreateDateColumn()
  TIRE_CREATED_AT: Date;

  @OneToOne(() => OwnCar)
  @JoinColumn({ name: 'OWN_CAR_ID' })
  ownCar: OwnCar;
}
