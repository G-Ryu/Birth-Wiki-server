import express from "express";
import { dataController } from "../controller";
const router = express.Router();

router.get("/date", dataController.date);

export = router;
