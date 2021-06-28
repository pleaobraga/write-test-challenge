import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { v4 } from "uuid";

let connection: Connection;
const email = "admin@rentex.com.br";
const password = "admin";

describe("Create Statement Controller", () => {
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

  it("should be able to create a deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email,
      password,
    });

    const { token } = responseToken.body;

    const resp = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 20,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(resp.status).toBe(201);
  });

  it("should not be able to create a deposit statement with no id user valid", async () => {
    const resp = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 20,
        description: "test",
      })
      .set({
        Authorization: `Bearer token`,
      });

    expect(resp.status).toBe(401);
  });

  it("should not be able to create a withdraw statement without money", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email,
      password,
    });

    const { token } = responseToken.body;

    const resp = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 30,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(resp.status).toBe(400);
  });

  it("should be able to create a withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email,
      password,
    });

    const { token } = responseToken.body;

    const resp = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(resp.status).toBe(201);
  });
});
