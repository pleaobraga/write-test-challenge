import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";

interface IRequest {
  sender_id: string;
  user_id: string;
  amount: number;
  description: string;
}

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,

    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    sender_id,
    user_id,
    amount,
    description,
  }: IRequest): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateTransferError.UserNotFound();
    }

    const { balance: senderBalance } =
      await this.statementsRepository.getUserBalance({
        user_id: sender_id,
      });

    if (senderBalance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    //withdraw money from sender
    await this.statementsRepository.create({
      user_id: sender_id,
      description,
      amount,
      type: OperationType.WITHDRAW,
    });

    //create transfer for user
    const transfer = await this.statementsRepository.create({
      user_id,
      sender_id,
      description: "transfer",
      amount,
      type: OperationType.TRANSFER,
    });

    return transfer;
  }
}

export { CreateTransferUseCase };
