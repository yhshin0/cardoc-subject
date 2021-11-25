import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OwnCar } from '../../own-cars/entities/own-car.entity';

@Entity({ name: 'TIRE' })
export class Tire {
  @PrimaryGeneratedColumn({ name: 'TIRE_ID' })
  id: number;

  @Column({ name: 'TIRE_FRONT_WIDTH' })
  frontWidth: number;

  @Column({ name: 'TIRE_FRONT_ASPECT_RATIO' })
  frontAspectRatio: number;

  @Column({ name: 'TIRE_FRONT_WHEEL_SIZE' })
  frontWheelSize: number;

  @Column({ name: 'TIRE_REAR_WIDTH' })
  rearWidth: number;

  @Column({ name: 'TIRE_REAR_ASPECT_RATIO' })
  rearAspectRatio: number;

  @Column({ name: 'TIRE_REAR_WHEEL_SIZE' })
  rearWheelSize: number;

  @CreateDateColumn({ name: 'TIRE_CREATED_AT' })
  createdAt: Date;

  @OneToOne(() => OwnCar)
  @JoinColumn({ name: 'OWN_CAR_ID' })
  ownCar: OwnCar;
}
