import { Pool, QueryResult } from "pg";
require("dotenv").config();

const pool = new Pool({
  user: "postgres",
  password: process.env.SQL_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "aram-analyzer",
});

export const query = async (
  text: string,
  params?: any[]
): Promise<QueryResult> => pool.query(text, params);

export const updateTable = async (
  tableName: string,
  updates: { [key: string]: any },
  conditionQuery: string
) => {
  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");
  const values = Object.values(updates);
  const query = `UPDATE ${tableName} SET ${setClause} WHERE ${conditionQuery}`;

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error("Error updating player:", err);
  }
};

export const upsertTable = async (
  tableName: string,
  updates: { [key: string]: any },
  conflictConstraints: string
) => {
  const columns = Object.keys(updates).join(", ");
  const values = Object.values(updates)
    .map((val) => {
      if (typeof val === "string") {
        return `'${val}'`;
      }
      if (typeof val === "object" && val !== null) {
      }
      return val;
    })
    .join(", ");
  const setQuery = Object.keys(updates)
    .map((key, index) => `${key} = EXCLUDED.${key}`)
    .join(", ");
  const query = `INSERT INTO ${tableName} (${columns}) VALUES (${values}) ON CONFLICT ON CONSTRAINT ${conflictConstraints} DO UPDATE SET ${setQuery}`;
  try {
    await pool.query(query);
  } catch (error) {
    console.error("Error upserting table:", error);
    console.error("Query:", query);
  }
};
