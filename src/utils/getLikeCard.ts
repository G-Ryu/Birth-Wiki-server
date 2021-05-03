import { getRepository } from "typeorm";
import { Wiki_daily } from "../entity/Wiki_daily";
import { Wiki_weekly } from "../entity/Wiki_weekly";
import { Wiki_issue } from "../entity/Wiki_issue";
import { Wiki_birth } from "../entity/Wiki_birth";
import { Wiki_death } from "../entity/Wiki_death";
import { Wiki_music } from "../entity/Wiki_music";
import { Wiki_movie } from "../entity/Wiki_movie";
import { User } from "../entity/User";
import { culture, dailyData, weeklyData } from "../types";
import { RecordCard } from "../entity/RecordCard";

export = async (nickName: string) => {
  let likeCards = [];

  const dailyData = async (likeIdArr: Wiki_daily[], field: string) => {
    if (likeIdArr.length === 0) {
      return null;
    }

    let repo;
    switch (field) {
      case "issue":
        repo = Wiki_issue;
        break;
      case "birth":
        repo = Wiki_birth;
        break;
      case "death":
        repo = Wiki_death;
        break;
    }

    try {
      for (let i = 0; i < likeIdArr.length; i++) {
        const stone: any[] = await getRepository(repo)
          .createQueryBuilder(`wiki_${field}`)
          .where(`wiki_${field}.date = :date`, { date: likeIdArr[i].id })
          .getMany();

        let card: dailyData = {
          id: likeIdArr[i].id,
          like: true,
          date: likeIdArr[i].date,
          image: likeIdArr[i].image,
          category: field,
        };
        let contents: [string, string[]][] = [];
        stone.forEach((event) => {
          contents.push([event.year, JSON.parse(event.event)]);
        });
        card.contents = contents;
        likeCards.push(card);
      }
    } catch (err) {
      console.log(`${field} like\n`, err);
    }
  };

  const weeklyData = async (likeIdArr: Wiki_weekly[], field: string) => {
    if (likeIdArr.length === 0) {
      return null;
    }

    let repo;
    switch (field) {
      case "movie":
        repo = Wiki_movie;
        break;
      case "music":
        repo = Wiki_music;
        break;
    }

    try {
      for (let i = 0; i < likeIdArr.length; i++) {
        const stone: any[] = await getRepository(repo)
          .createQueryBuilder(`wiki_${field}`)
          .where(`wiki_${field}.date = :date`, { date: likeIdArr[i].id })
          .getMany();

        let card: weeklyData = {
          id: likeIdArr[i].id,
          date: `${likeIdArr[i].date.slice(0, -2)}-${likeIdArr[i].date.slice(
            -2
          )}`,
          image: likeIdArr[i].image,
          like: true,
          category: field,
        };

        stone.forEach((event) => {
          let contents: culture = {
            title: event.title,
            poster: event.poster,
          };
          if (event.singer) {
            contents.singer = event.singer;
          }
          card[event.source] = contents;
        });
        likeCards.push(card);
      }
    } catch (err) {
      console.log(`${field} like\n`, err);
    }
  };

  try {
    const userLikeData = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.nickName = :nickName", { nickName })
      .leftJoinAndSelect("user.dailys", "wiki_daily")
      .leftJoinAndSelect("user.weeklys", "wiki_weekly")
      .leftJoinAndSelect("user.likeRecords", "action_card")
      .getOne();

    const userRecordData = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.nickName = :nickName", { nickName })
      .leftJoinAndSelect("user.cards", "action_card")
      .getOne();

    const birthIds: Wiki_daily[] = [];
    const issueIds: Wiki_daily[] = [];
    const deathIds: Wiki_daily[] = [];
    const musicIds: Wiki_weekly[] = [];
    const movieIds: Wiki_weekly[] = [];

    userLikeData.dailys.forEach((like) => {
      switch (like.fieldName) {
        case "issue":
          issueIds.push(like);
          break;
        case "birth":
          birthIds.push(like);
          break;
        case "death":
          deathIds.push(like);
          break;
      }
    });

    userLikeData.weeklys.forEach((like) => {
      switch (like.fieldName) {
        case "music":
          musicIds.push(like);
          break;
        case "movie":
          movieIds.push(like);
          break;
      }
    });

    await dailyData(issueIds, "issue");
    await dailyData(birthIds, "birth");
    await dailyData(deathIds, "death");
    await weeklyData(musicIds, "music");
    await weeklyData(movieIds, "movie");
    const likeRecordCards = 1;
    let recordCards;
    if (userRecordData.cards.length > 0) {
      recordCards = userRecordData.cards.map((card) => {
        return { ...card, like: true };
      });
    } else {
      recordCards = null;
    }

    if (likeCards.length === 0) {
      likeCards = null;
    }

    return {
      likeCards,
      recordCards,
    };
  } catch (err) {
    console.log("getLikeCard\n", err);
    return { likeCards: null, recordCards: null };
  }
};
