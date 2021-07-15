import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Create Statement Use Case", () => {
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get statement", async () => {
    const user = await createUserUseCase.execute(userData);

    const statement = await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit Test",
    });

    const getOperation = await getStatementOperationUseCase.execute({
      user_id: `${user.id}`,
      statement_id: `${statement.id}`,
    });

    expect(getOperation).toBeInstanceOf(Statement);
    expect(getOperation).toHaveProperty("id");
    expect(getOperation.user_id).toEqual(user.id);
    expect(getOperation.type).toEqual(OperationType.DEPOSIT);
    expect(getOperation.amount).toEqual(100);
    expect(getOperation.description).toEqual("Deposit Test");
  });

  it("should not be able to get balance if statement not found", async () => {
    const user = await createUserUseCase.execute(userData);

    const statement = await createStatementUseCase.execute({
      user_id: `${user.id}`,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit Test",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "",
        statement_id: "",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError);
  });
});
