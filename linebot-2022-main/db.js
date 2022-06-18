require("dotenv").config();

//node-postgresの仕様全然わかんないよ><
//とりあえず動かせるようにはした
class Postgres {
  constructor() {
    const { Pool } = require("pg");

    this.client = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  //stageのデフォルト値は0
  async createUser(userID, stage = 0) {
    try {
      const connect = await this.client.connect();

      const result = await connect.query(
        "INSERT INTO line_users (userID, stage) VALUES ($1::varchar, $2::integer) RETURNING *",
        [userID, stage]
      );

      connect.release();
      return result.rows[0];
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findUser(userID) {
    try {
      const connect = await this.client.connect();

      const result = await connect.query(
        "SELECT * FROM line_users WHERE userID = $1::varchar",
        [userID]
      );

      connect.release();
      return result.rows[0];
    } catch (err) {
      console.log(err);
    }
  }

  //SQLでも実現できるけどひとまずこれで
  //そのうち変えたい
  async findOrCreateUser(userID) {
    try {
      const existingUser = await this.findUser(userID);
      if (existingUser != undefined) {
        return existingUser;
      } else {
        return await this.createUser(userID);
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async setUserStage(userID, stage) {
    try {
      const connect = await this.client.connect();

      const result = await connect.query(
        "UPDATE line_users SET stage = $1::integer WHERE userID = $2::varchar RETURNING *",
        [stage, userID]
      );

      connect.release();
      return result.rows[0];
    } catch (err) {
      console.log(err);
    }
  }

  //指定ユーザーのstageをstep分だけ+する
  async advanceUserStage(userID, step = 1) {
    try {
      const connect = await this.client.connect();

      const result = await connect.query(
        "UPDATE line_users SET stage = stage + $1::integer WHERE userID = $2::varchar RETURNING *",
        [step, userID]
      );

      connect.release();
      return result.rows[0];
    } catch (err) {
      console.log(err);
    }
  }
}

const db = new Postgres();
exports.db = db;
