import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Get Balance Use Case", () => {
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;
  let getBalanceUseCase: GetBalanceUseCase;

  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  const userData = {
    name: "User Name",
    email: "email@email.com",
    password: "password",
  };

  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get balance", async () => {
    const user = await createUserUseCase.execute(userData);

    await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit Test",
    });

    await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.WITHDRAW,
      amount: 25,
      description: "Withdraw Test",
    });

    const response = await getBalanceUseCase.execute({ user_id: `${user.id}` });

    expect(response).toHaveProperty("balance");
    expect(response.balance).toEqual(75);
  });

  it("should not generate a balance if the user was not found", async () => {
    const user = await createUserUseCase.execute(userData);

    await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit Test",
    });

    await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.WITHDRAW,
      amount: 25,
      description: "Withdraw Test",
    });

    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "incorrectID",
      });
    }).rejects.toThrow(GetBalanceError);
  });
});
