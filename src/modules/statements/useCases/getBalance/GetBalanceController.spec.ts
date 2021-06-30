import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { v4 } from "uuid";

let connection: Connection;
const email = "admin@rentex.com.br";
const password = "admin";

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = v4();
    const passwordEncrypted = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin','${email}', '${passwordEncrypted}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email,
      password,
    });

    const { token } = responseToken.body;

    const resp = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(resp.status).toBe(200);
  });

  it("should not be able to get balance", async () => {
    const resp = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer token`,
    });

    expect(resp.status).toBe(401);
  });
});
