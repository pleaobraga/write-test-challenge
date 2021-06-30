import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should not be able to create a statement if user does not exist", async () => {
    const props = {
      user_id: "1",
      type: OperationType.DEPOSIT,
      amount: 20,
      description: "test",
    };

    await expect(createStatementUseCase.execute({ ...props })).rejects.toEqual(
      new CreateStatementError.UserNotFound()
    );
  });

  it("should create statement", async () => {
    const userProps = {
      name: "user test",
      email: "test@g.com",
      password: "1234",
    };

    const user = await usersRepository.create({ ...userProps });

    const props = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 20,
      description: "test",
    };

    const statement = await createStatementUseCase.execute({ ...props });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a withdraw without money in account", async () => {
    const userProps = {
      name: "user test",
      email: "test@g.com",
      password: "1234",
    };

    const user = await usersRepository.create({ ...userProps });

    const props = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "test",
    };

    await createStatementUseCase.execute({ ...props });

    await expect(
      createStatementUseCase.execute({
        ...props,
        type: OperationType.WITHDRAW,
        amount: 40,
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
