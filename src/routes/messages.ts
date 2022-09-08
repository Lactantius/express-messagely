import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import db from "../db";
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");
import Message from "../models/message";
//const Message = require("../models/message");

const router = Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const message = await Message.get(id);
    const { username } = req.user;
    if (
      username !== message.to_user.username &&
      username !== message.from_user.username
    ) {
      return next({ status: 401, message: "Unauthorized" });
    }
    return res.json({ message: message });
  } catch (err) {
    return next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const { to_username, body } = req.body;
    const { username } = req.user;
    const message = await Message.create({
      from_username: username,
      to_username,
      body,
    });
    return res.json({ message: message });
  } catch (err) {
    return next(err);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const message = await Message.get(id);
    const { username } = req.user;
    if (username !== message.to_user.username) {
      return next({ status: 401, message: "Unauthorized" });
    }
    const read = await Message.markRead(id);
    return res.json({ message: read });
  } catch (err) {
    return next(err);
  }
});

export default router;
