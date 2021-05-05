import { User } from "../../entity/User";
import { getRepository } from "typeorm";

export = async (req, res) => {
  const { userEmail, nickName } = req.query;

  if (userEmail) {
    try {
      const existEmail = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.userEmail = :userEmail", { userEmail })
        .getOne();

      existEmail
        ? res.status(401).send({ message: "unverified email" })
        : res.send({ message: "available email" });
    } catch {
      res.status(400).send({ message: "something wrong" });
    }
  }

  if (nickName) {
    try {
      const existNick = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.nickName = :nickName", { nickName })
        .getOne();

      existNick
        ? res.status(401).send({ message: "unverified nickName" })
        : res.send({ message: "available nickName" });
    } catch (err) {
      console.log("user-exist\n", err);
      res.status(400).send({ message: "something wrong" });
    }
  }
};
