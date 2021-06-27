import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { v4 } from "uuid";

let connection: Connection;
const email = "admin@rentex.com.br";
const password = "admin";

describe.only("Create User Controller", () => {
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

  it("should be able to authenticate", async () => {
    const resp = await request(app).post("/api/v1/sessions").send({
      email,
      password,
    });

    expect(resp.status).toBe(200);
  });

  it("should not be able to authenticate with wrong pass", async () => {
    const resp = await request(app).post("/api/v1/sessions").send({
      email,
      password: "2",
    });

    expect(resp.status).toBe(401);
  });

  it("should not be able to authenticate with wrong email", async () => {
    const resp = await request(app).post("/api/v1/sessions").send({
      email: "teste novo",
      password,
    });

    expect(resp.status).toBe(401);
  });
});
