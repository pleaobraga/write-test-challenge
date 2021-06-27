import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe.only("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const resp = await request(app).post("/api/v1/users").send({
      name: "test",
      email: "tes@g.com",
      password: "1234",
    });

    expect(resp.status).toBe(201);
  });
});
