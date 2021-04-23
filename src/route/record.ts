import express from "express";
import { recordController } from "../controller";
const router = express.Router();

import multer from "multer";
const _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "image/record/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: _storage });

router.post("/create", upload.single("cardImage"), recordController.create);
router.patch("/update", upload.single("cardImage"), recordController.update);
router.delete("/delete", recordController.delete);
router.post("/look", recordController.look);

export = router;
