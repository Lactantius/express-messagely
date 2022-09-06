/** Database connection for messagely. */


import { Client } from "pg";
const { DB_URI } = require("./config");

const client = new Client(DB_URI);

client.connect();


export default client;
