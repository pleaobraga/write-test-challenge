import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should not be able to create a statement if user does not exist", async () => {
    expect(async () => {
      const props = {
        user_id: "1",
        type: OperationType.DEPOSIT,
        amount: 20,
        description: "test",
      };

      await getBalanceUseCase.execute({ ...props });
    }).rejects.toBeInstanceOf(GetBalanceError);
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
      amount: 10,
      description: "test",
    };

    await statementsRepository.create({ ...props });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toHaveProperty("balance");
  });
});
