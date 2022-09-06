/** User class for message.ly */

import db from "../db";
import bcrypt from "bcrypt";

const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

interface UserData {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({
    username,
    password,
    first_name,
    last_name,
    phone,
  }: UserData): Promise<UserData> {
    const hashed = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashed, first_name, last_name, phone]
    );
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username: string, password) {}

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username: string) {}

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {}

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username: string) {}

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username: string) {}

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username: string) {}
}

module.exports = User;
