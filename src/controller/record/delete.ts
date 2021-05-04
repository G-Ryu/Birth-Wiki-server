import { getConnection } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";

export = async (req, res) => {
  const { cardId } = req.body;
  const nickName = req.nickName;

  if (!nickName) {
    res.status(403).send({ message: "invalid user" });
    return;
  }

  try {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(RecordCard)
      .where("record_card.id = :id", { id: cardId })
      .execute();

    res.send({ message: "delete record" });
  } catch (err) {
    console.log("record-delete\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
