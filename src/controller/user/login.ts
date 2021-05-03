import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../../entity/User";
import { Refresh } from "../../entity/Refresh";
import getLikeCard from "../../utils/getLikeCard";
import("dotenv/config");

export = async (req, res) => {
  const { AuthorizationCode, source, userEmail, password } = req.body;
  if (!source) {
    res.status(401).send({ message: "unregistered user" });
    return;
  }

  let userData;
  let nickName;
  let profileImage;
  let accessToken;
  let refreshToken;
  let refreshData;
  let hashRT;
  let email = userEmail;

  try {
    if (source === "home") {
      const hashPW = crypto
        .createHmac("sha256", process.env.SHA_PW)
        .update(password)
        .digest("hex");

      userData = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.userEmail = :userEmail", { userEmail })
        .andWhere("user.password = :password", { password: hashPW })
        .leftJoinAndSelect("user.refresh", "refresh")
        .getOne();

      if (!userData) {
        res.status(401).send({ message: "unregistered user" });
        return;
      }

      nickName = userData.nickName;
      profileImage = userData.profileImage;

      if (!userData.refresh) {
        refreshData = new Refresh();
      } else {
        hashRT = userData.refresh.hashRT;

        refreshData = await getRepository(Refresh)
          .createQueryBuilder("refresh")
          .where("refresh.hashRT = :hashRT", { hashRT: hashRT })
          .getOne();
      }
    } else {
      if (source === "google") {
        const {
          data: { access_token },
        } = await axios({
          url: "https://oauth2.googleapis.com/token",
          method: "post",
          data: {
            client_id: process.env.G_CLIENTID,
            client_secret: process.env.G_CLIENTSR,
            code: AuthorizationCode,
            grant_type: "authorization_code",
            redirect_uri: process.env.REDIRECT_URI,
          },
        });

        const profile = await axios({
          url: "https://www.googleapis.com/oauth2/v2/userinfo",
          method: "get",
          headers: {
            authorization: `Bearer ${access_token}`,
          },
        });

        email = profile.data.email;
        nickName = profile.data.name;
        profileImage = profile.data.picture;
      }

      if (source === "kakao") {
        const {
          data: { access_token },
        } = await axios({
          url: "https://kauth.kakao.com/oauth/token",
          method: "post",
          params: {
            client_id: process.env.K_CLIENTID,
            client_secret: process.env.K_CLIENTSR,
            code: AuthorizationCode,
            grant_type: "authorization_code",
            redirect_uri: process.env.REDIRECT_URI,
          },
        });

        const profile = await axios({
          url: "https://kapi.kakao.com/v2/user/me",
          method: "post",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        email = String(profile.data.id);
        nickName = profile.data.kakao_account.profile.nickname;
        profileImage = profile.data.kakao_account.profile.profile_image_url;
      }

      if (source === "naver") {
        const {
          data: { access_token },
        } = await axios({
          url: "https://nid.naver.com/oauth2.0/token",
          method: "post",
          params: {
            client_id: process.env.N_CLIENTID,
            client_secret: process.env.N_CLIENTSR,
            code: AuthorizationCode,
            grant_type: "authorization_code",
            redirect_uri: process.env.REDIRECT_URI,
          },
        });

        const profile = await axios({
          url: "https://openapi.naver.com/v1/nid/me",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        email = String(profile.data.response.email);
        nickName = profile.data.response.nickname;
        profileImage = profile.data.response.profile_image;
      }

      userData = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.userEmail = :userEmail", {
          userEmail: email,
        })
        .leftJoinAndSelect("user.refresh", "refresh")
        .getOne();

      if (!userData) {
        userData = new User();
        userData.userEmail = email;
        userData.nickName = nickName;
        userData.profileImage = profileImage;
        await userData.save();

        refreshData = new Refresh();
      } else {
        nickName = userData.nickName;
        profileImage = userData.profileImage;
        hashRT = userData.refresh.hashRT;

        refreshData = await getRepository(Refresh)
          .createQueryBuilder("refresh")
          .where("refresh.hashRT = :hashRT", { hashRT })
          .getOne();
      }
    }

    accessToken = jwt.sign({ nickName }, process.env.SHA_AT, {
      expiresIn: 3600,
    });

    refreshToken = jwt.sign({ id: userData.id }, process.env.SHA_RT, {
      expiresIn: 2419200,
    });

    refreshData.token = refreshToken;
    await refreshData.save();

    if (!hashRT) {
      hashRT = crypto
        .createHmac("sha256", process.env.SHA_RT)
        .update(String(refreshData.id))
        .digest("hex");

      refreshData.hashRT = hashRT;
      await refreshData.save();

      userData.refresh = refreshData;
      await userData.save();
    }

    let userCard = await getLikeCard(nickName);

    res
      .cookie("refreshToken", hashRT, {
        domain: "birthwiki.space",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({
        data: {
          userEmail: email,
          nickName,
          profileImage,
          accessToken,
          likeCards: userCard.likeCards,
          recordCards: userCard.recordCards,
        },
      });
  } catch (err) {
    console.log("login\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
