import { getRepository } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";
import verification from "../../utils/verification";

export = async (req, res) => {
  const { source, cardId, privacy, contents, accessToken } = req.body;
  const refreshToken = req.cookies.refreshToken;

  let verify = await verification(source, accessToken, refreshToken);

  if (verify.action === "error") {
    res.status(403).send({ message: "unavailable token" });
    return;
  }

  try {
    const oneCase = await getRepository(RecordCard)
      .createQueryBuilder("record_card")
      .where("record_card.id = :id", { id: cardId })
      .getOne();

    oneCase.cardDesc = contents;
    oneCase.privacy = privacy;
    if (req.file) {
      oneCase.cardImage = req.file.path;
    }
    await oneCase.save();

    if (verify.action === "change") {
      res.send({
        data: { accessToken: verify.accessToken },
        message: "update record",
      });
    } else {
      res.send({
        message: "update record",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "something wrong" });
  }
};
