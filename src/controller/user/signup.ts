import { User } from "../../entity/User";
import crypto from "crypto";
import("dotenv/config");

export = async (req, res) => {
  const { userEmail, nickName, password } = req.body;

  try {
    const hashPW = crypto
      .createHmac("sha256", process.env.SHA_PW)
      .update(password)
      .digest("hex");

    const user = new User();
    user.userEmail = userEmail;
    user.nickName = nickName;
    user.password = hashPW;
    user.source = "home";
    if (req.file) {
      user.profileImage = `https://server.birthwiki.space/${req.file.path}`;
    }
    await user.save();

    res.send({ message: "signUp" });
  } catch (err) {
    console.log("user-signup\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};
