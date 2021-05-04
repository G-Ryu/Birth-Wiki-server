import { getRepository } from "typeorm";
import { Wiki_weather } from "../../entity/Wiki_weather";
import { Wiki_weekly } from "../../entity/Wiki_weekly";
import { Wiki_birth } from "../../entity/Wiki_birth";
import { Wiki_daily } from "../../entity/Wiki_daily";
import { Wiki_death } from "../../entity/Wiki_death";
import { Wiki_issue } from "../../entity/Wiki_issue";
import { Wiki_movie } from "../../entity/Wiki_movie";
import { Wiki_music } from "../../entity/Wiki_music";
import { culture, dailyData, weeklyData } from "../../types";

export = async (req, res) => {
  const date = req.query.date;
  let curYear: number;

  const weekCount = (yyyy: number, mm: number, dd: number): string => {
    let today = new Date(yyyy, mm - 1, dd);
    let defaultDay = new Date(1958, 7, 4);
    while (today > defaultDay) {
      defaultDay.setDate(defaultDay.getDate() + 7);
    }
    defaultDay.setDate(defaultDay.getDate() - 7);
    today = defaultDay;
    curYear = today.getFullYear();
    let countDay = new Date(curYear, 0, 1);
    let week = 1;
    while (today > countDay) {
      countDay.setDate(countDay.getDate() + 1);
      let countNum = countDay.getDay();
      if (countNum == 0) {
        week++;
      }
    }

    return week < 10 ? "0" + week : "" + week;
  };

  const year: number = Number(date.split("-")[0]);
  const month: number = Number(date.split("-")[1]);
  const day: number = Number(date.split("-")[2]);
  const week: string = weekCount(year, month, day);
  const weekly: string = curYear + week;

  const getDaily = async (field: string, dateData: Wiki_daily) => {
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
      const stone: any[] = await getRepository(repo)
        .createQueryBuilder(`wiki_${field}`)
        .where(`wiki_${field}.date = :date`, { date: dateData.id })
        .getMany();

      let card: dailyData = {
        id: dateData.id,
        date: dateData.date,
        image: dateData.image,
        category: field,
      };
      
      let contents: [string, string[]][] = [];
      stone.forEach((event) => {
        contents.push([event.year, JSON.parse(event.event)]);
      });
      card.contents = contents;

      return card;
    } catch (err) {
      console.log(`${field} date\n`, err);
    }
  };

  const getWeekly = async (field: string, dateData: Wiki_weekly) => {
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
      const stone: any[] = await getRepository(repo)
        .createQueryBuilder(`wiki_${field}`)
        .where(`wiki_${field}.date = :date`, { date: dateData.id })
        .getMany();

      let card: weeklyData = {
        id: dateData.id,
        date: `${weekly.slice(0, -2)}-${weekly.slice(-2)}`,
        image: dateData.image,
        category: field,
        korea: null,
        world: null,
      };

      if (stone.length > 0) {
        stone.forEach((event) => {
          let contents: culture = {
            title: event.title,
            poster: event.poster,
          };
          if (field === "music") {
            contents.singer = event.singer;
          }
          card[event.source] = contents;
        });
      }

      return card;
    } catch (err) {
      console.log(`${field} date\n`, err);
    }
  };

  try {
    const dailyData = await getRepository(Wiki_daily)
      .createQueryBuilder("wiki_daily")
      .where("wiki_daily.date = :date", { date: `${month}-${day}` })
      .getMany();

    const weeklyData = await getRepository(Wiki_weekly)
      .createQueryBuilder("wiki_weekly")
      .where("wiki_weekly.date = :date", { date: weekly })
      .getMany();

    const issueData = dailyData[0];
    const birthData = dailyData[1];
    const deathData = dailyData[2];
    const movieId = weeklyData[0];
    const musicId = weeklyData[1];

    const issueCard = await getDaily("issue", issueData);
    const birthCard = await getDaily("birth", birthData);
    const deathCard = await getDaily("death", deathData);
    const movieCard = movieId ? await getWeekly("movie", movieId) : null;
    const musicCard = musicId ? await getWeekly("music", musicId) : null;
    let weatherCard = null;

    const weatherData = await getRepository(Wiki_weather)
      .createQueryBuilder("birth_wiki_daily")
      .where("birth_wiki_daily.date = :date", { date })
      .getOne();

    if (weatherData) {
      weatherCard = {
        id: weatherData.id,
        weather: weatherData.weather,
        temperature: JSON.parse(weatherData.temperature),
      };
    }

    res.send({
      data: {
        issueCard,
        birthCard,
        deathCard,
        musicCard,
        movieCard,
        weatherCard,
      },
    });
  } catch (err) {
    console.log("data-date\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
