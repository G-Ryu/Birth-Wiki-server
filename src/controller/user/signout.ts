import { getConnection } from "typeorm";
import { User } from "../../entity/User";
import("dotenv/config");

export = async (req, res) => {
  const nickName = req.nickName;

  if (!nickName) {
    res.status(403).send({ message: "invalid user" });
    return;
  }

  try {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .where("nickName = :nickName", { nickName })
      .execute();

    res
      .clearCookie("refreshToken", {
        domain: "birthwiki.space",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({ message: "signOut" });
  } catch {
    res.status(400).send({ message: "something wrong" });
  }
};
