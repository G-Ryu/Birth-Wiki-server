import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { RecordCard } from "./RecordCard";
import { Refresh } from "./Refresh";
import { Wiki_daily } from "./Wiki_daily";
import { Wiki_weekly } from "./Wiki_weekly";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  nickName: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  revokeRT: string;

  @Column({ nullable: true })
  source: string;

  @OneToMany(() => RecordCard, (card) => card.user)
  cards: RecordCard[];

  @ManyToMany(() => Wiki_daily, { cascade: true })
  @JoinTable({
    name: "user_like_daily",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "wikiId",
      referencedColumnName: "id",
    },
  })
  dailys: Wiki_daily[];

  @ManyToMany(() => Wiki_weekly, { cascade: true })
  @JoinTable({
    name: "user_like_weekly",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "wikiId",
      referencedColumnName: "id",
    },
  })
  weeklys: Wiki_weekly[];

  @ManyToMany(() => RecordCard, { cascade: true })
  @JoinTable({
    name: "user_like_record",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "recordId",
      referencedColumnName: "id",
    },
  })
  likeRecords: RecordCard[];

  @OneToOne(() => Refresh, (refresh) => refresh.id)
  @JoinColumn()
  refresh: Refresh;
}
