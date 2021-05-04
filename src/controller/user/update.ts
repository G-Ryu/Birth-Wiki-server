import { User } from "../../entity/User";
import { getRepository } from "typeorm";
import crypto from "crypto";
import("dotenv/config");

export = async (req, res) => {
  const { password } = req.body;
  const nickName = req.nickName;

  if (!nickName) {
    res.status(403).send({ message: "invalid user" });
    return;
  }

  const hashPW = password
    ? crypto
        .createHmac("sha256", process.env.SHA_PW)
        .update(password)
        .digest("hex")
    : null;

  try {
    const user = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.userEmail = :userEmail", { userEmail })
      .getOne();

    user.nickName = nickName || user.nickName;
    user.password = hashPW || user.password;
    if (req.file) {
      user.profileImage = `https://server.birthwiki.space/${req.file.path}`;
    }
    await user.save();

    if (verify.action === "change") {
      res.send({
        data: { accessToken: verify.accessToken },
        message: "update userInfo",
      });
    } else {
      res.send({
        message: "update userInfo",
      });
    }
  } catch {
    res.status(400).send({ message: "something wrong" });
  }
};
