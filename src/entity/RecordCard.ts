import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { User } from "./User";

@Entity()
export class RecordCard extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column({ nullable: true })
  cardImage: string;

  @Column()
  writer: string;

  @Column({ nullable: true })
  cardDesc: string;

  @Column()
  privacy: boolean;

  @ManyToOne(() => User, { cascade: true })
  user: User;

  @ManyToMany(() => User, { cascade: true })
  users: User[];
}
