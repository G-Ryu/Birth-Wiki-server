import { getRepository } from "typeorm";
import { User } from "../../entity/User";
import verification from "../../func/verification";

export = async (req, res) => {
  const { source, nickName, accessToken } = req.body;

  const refreshToken = req.cookies.refreshToken;

  let verify = await verification(source, accessToken, refreshToken);

  if (verify.action === "error") {
    res.status(403).send({ message: "unavailable token" });
    return;
  }

  try {
    const userRecordData = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.nickName = :nickName", { nickName })
      .leftJoinAndSelect("user.cards", "action_card")
      .getOne();

    let recordCards =
      userRecordData.cards.length > 0 ? userRecordData.cards : null;

    if (verify.action === "change") {
      res.send({ data: { recordCards, accessToken: verify.accessToken } });
    } else {
      res.send({ data: { recordCards } });
    }
  } catch (err) {
    console.log("recordLook\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
