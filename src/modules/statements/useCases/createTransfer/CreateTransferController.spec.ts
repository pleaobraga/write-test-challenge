import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { v4 } from "uuid";

let connection: Connection;
const email = "admin@rentex.com.br";
const password = "admin";
const adminId = v4();
const userId = v4();

describe("Create transfer Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const passwordEncrypted = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${adminId}', 'admin','${email}', '${passwordEncrypted}', 'now()', 'now()')`
    );

    const passwordUserEncrypted = await hash("user", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${userId}', 'user','user@g.com', '${passwordUserEncrypted}', 'now()', 'now()')`
    );

    const statementId = v4();

    await connection.query(
      `INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at)
      values('${statementId}', '${adminId}', 'deposit', 500, 'deposit','now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to transfer for a user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email,
      password,
    });

    const { token } = responseToken.body;

    const resp = await request(app)
      .post(`/api/v1/statements/transfer/${userId}`)
      .send({
        amount: 100,
        description: "new transfer",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(resp.status).toBe(201);
  });

  it("should not be able to transfer for a user without enough money", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email,
      password,
    });

    const { token } = responseToken.body;

    const resp = await request(app)
      .post(`/api/v1/statements/transfer/${userId}`)
      .send({
        amount: 1000,
        description: "new transfer",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(resp.status).toBe(400);
    expect(resp.body.message).toBe("Insufficient funds");
  });

  it("should not be able to transfer for a inexistent user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email,
      password,
    });

    const { token } = responseToken.body;

    const resp = await request(app)
      .post(`/api/v1/statements/transfer/${v4()}`)
      .send({
        amount: 100,
        description: "new transfer",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(resp.status).toBe(404);
    expect(resp.body.message).toBe("User not found");
  });
});
