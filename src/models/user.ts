/** User class for message.ly */

import db from "../db";
import bcrypt from "bcrypt";
import Message from "./message";

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
    const joinAt = new Date();
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashed, first_name, last_name, phone, joinAt]
    );
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(
    username: string,
    password: string
  ): Promise<boolean> {
    const hashedInDB = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    return bcrypt.compare(password, hashedInDB.rows[0].password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username: string): Promise<void> {
    const timestamp = new Date();
    const result = await db.query(
      `UPDATE users SET last_login_at=$1 WHERE username=$2`,
      [timestamp, username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all(): Promise<User[]> {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone
        FROM users`
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username: string): Promise<User> {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username=$1`,
      [username]
    );
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username: string): Promise<Message[]> {
    const result = await db.query(
      `SELECT id, body, sent_at, read_at,
          json_build_object('first_name', first_name, 'last_name', last_name,
          'phone', phone, 'username', username) AS to_user
        FROM messages
        JOIN users
        ON users.username = messages.to_username
        WHERE from_username=$1`,
      [username]
    );
    return result.rows;
  }

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
