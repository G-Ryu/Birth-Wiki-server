import { getRepository } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";

export = async (req, res) => {
  const { cardId, privacy, cardDesc } = req.body;
  const nickName = req.nickName;

  if (!nickName) {
    res.status(403).send({ message: "invalid user" });
    return;
  }

  try {
    const recordCard = await getRepository(RecordCard)
      .createQueryBuilder("record_card")
      .where("record_card.id = :id", { id: cardId })
      .getOne();

    recordCard.cardDesc = cardDesc;
    recordCard.privacy = privacy || recordCard.privacy;
    if (req.file) {
      recordCard.cardImage = req.file.path;
    }
    await recordCard.save();

    delete recordCard.user;

    res.send({ data: { recordCard }, message: "update record" });
  } catch (err) {
    console.log("record-update\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
