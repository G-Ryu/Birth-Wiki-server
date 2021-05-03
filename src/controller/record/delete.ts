import { getConnection } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";
import verification from "../../utils/verification";

export = async (req, res) => {
  const { source, cardId, accessToken } = req.body;
  const refreshToken = req.cookies.refreshToken;

  let verify = await verification(source, accessToken, refreshToken);

  if (verify.action === "error") {
    res.status(403).send({ message: "unavailable token" });
    return;
  }

  try {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(RecordCard)
      .where("record_card.id = :id", { id: cardId })
      .execute();

    if (verify.action === "change") {
      res.send({
        data: { accessToken: verify.accessToken },
        message: "delete record",
      });
    } else {
      res.send({
        message: "delete record",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "something wrong" });
  }
};
