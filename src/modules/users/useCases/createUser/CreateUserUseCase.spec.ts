import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should not create new user when he is already exists", async () => {
    expect(async () => {
      const userProps = {
        name: "name test",
        email: "email@g.com",
        password: "test",
      };

      await createUserUseCase.execute({ ...userProps });

      await createUserUseCase.execute({ ...userProps });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

  it("should create new user", async () => {
    const userProps = {
      name: "name test",
      email: "email@g.com",
      password: "test",
    };

    const user = await createUserUseCase.execute({ ...userProps });

    expect(user).toHaveProperty("id");
  });
});
