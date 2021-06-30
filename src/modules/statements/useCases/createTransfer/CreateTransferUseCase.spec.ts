import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createTransferUseCase: CreateTransferUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

const senderProps = {
  name: "sender",
  email: "sender@g.com",
  password: "test",
};

const receiverProps = {
  name: "receiver",
  email: "receiver@g.com",
  password: "test",
};

let sender: User;

const transferProps = {
  user_id: "1234",
  amount: 100,
  description: "transfer",
};

describe("Create transfer use case", () => {
  beforeEach(async () => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createTransferUseCase = new CreateTransferUseCase(
      statementsRepository,
      usersRepository
    );

    sender = await usersRepository.create({ ...senderProps });
  });

  it("should not be able to transfer for an invalid user", async () => {
    await expect(
      createTransferUseCase.execute({
        ...transferProps,
        sender_id: sender.id as string,
        user_id: "1234",
      })
    ).rejects.toEqual(new CreateTransferError.UserNotFound());
  });

  it("should not be able to transfer if user does not have money", async () => {
    const receiver = await usersRepository.create({ ...receiverProps });

    await expect(
      createTransferUseCase.execute({
        ...transferProps,
        sender_id: sender.id as string,
        user_id: receiver.id as string,
      })
    ).rejects.toEqual(new CreateTransferError.InsufficientFunds());
  });

  it("should  be able to transfer money for another user", async () => {
    const receiver = await usersRepository.create({ ...receiverProps });

    await statementsRepository.create({
      amount: 500,
      type: OperationType.DEPOSIT,
      description: "create operation",
      user_id: sender.id as string,
    });

    const transfer = await createTransferUseCase.execute({
      ...transferProps,
      sender_id: sender.id as string,
      user_id: receiver.id as string,
    });

    const userStatementOperation =
      await statementsRepository.findStatementOperation({
        statement_id: transfer.id as string,
        user_id: receiver.id as string,
      });

    expect(userStatementOperation).toEqual(transfer);

    const senderBalance = await statementsRepository.getUserBalance({
      user_id: sender.id as string,
    });

    expect(senderBalance.balance).toBe(400);

    const receiverBalance = await statementsRepository.getUserBalance({
      user_id: receiver.id as string,
    });

    expect(receiverBalance.balance).toBe(100);
  });
});
