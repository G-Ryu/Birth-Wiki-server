import { getRepository } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";
import { User } from "../../entity/User";

export = async (req, res) => {
  const { date, privacy, cardDesc } = req.body;
  const nickName = req.nickName;

  if (!nickName) {
    res.status(403).send({ message: "invalid user" });
    return;
  }

  try {
    const user = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.nickName = :nickName", { nickName })
      .getOne();

    const recordCard = new RecordCard();
    recordCard.date = date;
    recordCard.cardDesc = cardDesc;
    recordCard.user = user;
    recordCard.privacy = privacy || false;
    recordCard.writer = nickName;
    if (req.file) {
      recordCard.cardImage = req.file.path;
    }
    await recordCard.save();

    delete recordCard.user;

    res.send({ data: { recordCard }, message: `create record` });
  } catch (err) {
    console.log("record-create\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
