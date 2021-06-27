import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should not authenticate user without correct email", async () => {
    expect(async () => {
      const userProps = {
        email: "email@g.com",
        password: "test",
        name: "test pedro",
      };

      const user = await usersRepository.create({ ...userProps });

      await authenticateUserUseCase.execute({ ...user, email: "1" });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not authenticate user without correct password", async () => {
    expect(async () => {
      const userProps = {
        email: "email@g.com",
        password: "test",
        name: "test pedro",
      };

      const user = await usersRepository.create({ ...userProps });

      await authenticateUserUseCase.execute({ ...user, password: "1" });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should authenticate user", async () => {
    const password = "test";
    const passwordHash = await hash(password, 8);

    const userProps = {
      name: "name test",
      email: "email@g.com",
      password: passwordHash,
    };

    const user = await usersRepository.create({ ...userProps });

    const resp = await authenticateUserUseCase.execute({
      ...user,
      password,
    });

    expect(resp).toHaveProperty("token");
  });
});
