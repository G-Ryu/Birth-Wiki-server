import { getConnection } from "typeorm";
import { User } from "../../entity/User";
import crypto from "crypto";
import axios from "axios";
import verification from "../../utils/verification";
import("dotenv/config");

export = async (req, res) => {
  try {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .where("nickName = :nickName", { nickName })
      .execute();

    res
      .clearCookie("refreshToken", {
        domain: "localhost",
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
