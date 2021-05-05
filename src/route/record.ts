import express from "express";
import { recordController } from "../controller";
const router = express.Router();

import multer from "multer";
import path from "path";
const _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "image/record/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: _storage });

router.post("/create", upload.single("cardImage"), recordController.create);
router.patch("/update", upload.single("cardImage"), recordController.update);
router.delete("/delete", recordController.delete);

export = router;
