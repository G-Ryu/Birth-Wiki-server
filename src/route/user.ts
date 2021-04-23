import express from "express";
import { userController } from "../controller";
const router = express.Router();

import multer from "multer";
const _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "image/profile/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: _storage });

router.post("/signup", upload.single("profileImage"), userController.signup);
router.post("/signout", userController.signout);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/exist", userController.exist);
router.post("/update", upload.single("profileImage"), userController.update);
router.post("/info", userController.info);

export = router;
