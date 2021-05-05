import axios from "axios";
import { getConnection, getRepository } from "typeorm";
import { User } from "../../entity/User";
import("dotenv/config");

export = async (req, res) => {
  const nickName = req.nickName;

  if (!nickName) {
    res.status(403).send({ message: "invalid user" });
    return;
  }

  try {
    const user = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.nickName = :nickName", { nickName })
      .getOne();

    const revokeRT = user.revokeRT;
    if (user.source === "google") {
      await axios({
        url: `https://oauth2.googleapis.com/revoke?token=${revokeRT}`,
        method: "POST",
      });
    }

    if (user.source === "naver") {
      await axios({
        url: `https://nid.naver.com/oauth2.0/token`,
        method: "post",
        params: {
          client_id: process.env.N_CLIENTID,
          client_secret: process.env.N_CLIENTSR,
          grant_type: "refresh_token",
          refresh_token: encodeURI(revokeRT),
        },
      }).then(async (res) => {
        await axios({
          url: "https://nid.naver.com/oauth2.0/token",
          method: "POST",
          params: {
            client_id: process.env.N_CLIENTID,
            client_secret: process.env.N_CLIENTSR,
            grant_type: "delete",
            access_token: encodeURI(res.data.access_token),
            service_provider: "NAVER",
          },
        });
      });
    }

    if (user.source === "kakao") {
      await axios({
        url: "https://kapi.kakao.com/v1/user/unlink",
        method: "POST",
        headers: {
          Authorization: `KakaoAK ${process.env.K_ADMINKEY}`,
        },
        params: {
          target_id_type: "user_id",
          target_id: user.userEmail,
        },
      });
    }

    user.remove();
    /*
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .where("nickName = :nickName", { nickName })
      .execute();
*/
    res
      .clearCookie("refreshToken", {
        domain: "birthwiki.space",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({ message: "signOut" });
  } catch (err) {
    console.log("user-signout\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
