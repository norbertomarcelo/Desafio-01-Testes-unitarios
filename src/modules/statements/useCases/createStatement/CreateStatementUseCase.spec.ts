import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

describe("Create Statement Use Case", () => {
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;

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
  });

  it("should create a deposit", async () => {
    const user = await createUserUseCase.execute(userData);

    const statement = await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit Test",
    });

    expect(statement).toBeInstanceOf(Statement);
    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toEqual(user.id);
    expect(statement.type).toEqual(OperationType.DEPOSIT);
    expect(statement.amount).toEqual(100);
    expect(statement.description).toEqual("Deposit Test");
  });

  it("should create a withdraw", async () => {
    const user = await createUserUseCase.execute(userData);

    await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit Test",
    });

    const statement = await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.WITHDRAW,
      amount: 25,
      description: "Withdraw Test",
    });

    expect(statement).toBeInstanceOf(Statement);
    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toEqual(user.id);
    expect(statement.type).toEqual(OperationType.WITHDRAW);
    expect(statement.amount).toEqual(25);
    expect(statement.description).toEqual("Withdraw Test");
  });

  it("it should not be possible to make a transaction with insufficient balance", async () => {
    const user = await createUserUseCase.execute(userData);

    await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.DEPOSIT,
      amount: 25,
      description: "Deposit Test",
    });

    expect(async () => {
      const statement = await createStatementUseCase.execute({
        user_id: `${user.id}`,
        type: OperationType.WITHDRAW,
        amount: 26,
        description: "Withdraw Test",
      });
    }).rejects.toThrow(CreateStatementError.InsufficientFunds);
  });

  it("should not create a transaction if the user is not found", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "",
        type: OperationType.DEPOSIT,
        amount: 25,
        description: "Deposit Test",
      });
    }).rejects.toThrow(CreateStatementError.UserNotFound);
  });
});
