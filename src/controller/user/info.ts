import { getRepository } from "typeorm";
import { User } from "../../entity/User";
import verification from "../../utils/verification";
import("dotenv/config");

export = async (req, res) => {
  const { source, userEmail, accessToken } = req.body;
  const refreshToken = req.cookies.refreshToken;

  let verify = await verification(source, accessToken, refreshToken);

  if (verify.action === "error") {
    res.status(403).send({ message: "unavailable token" });
    return;
  }

  try {
    const user = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.userEmail = :userEmail", { userEmail })
      .getOne();

    if (verify.action === "change") {
      res.send({
        data: {
          nickName: user.nickName,
          profileImage: user.profileImage,
          accessToken: verify.accessToken,
        },
      });
    } else {
      res.send({
        data: {
          nickName: user.nickName,
          profileImage: user.profileImage,
          accessToken,
        },
      });
    }
  } catch (err) {
    console.log("info\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
