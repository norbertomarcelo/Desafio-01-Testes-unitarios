import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

describe("Create User Use Case", () => {
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  const userDataStandard: ICreateUserDTO = {
    name: "User Name",
    email: "email@email.com",
    password: "password",
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to crate a new user", async () => {
    const user = await createUserUseCase.execute(userDataStandard);

    expect(user).toHaveProperty("name");
    expect(user.name).toEqual(userDataStandard.name);
    expect(user).toHaveProperty("email");
    expect(user.email).toEqual(userDataStandard.email);
    expect(user).toHaveProperty("password");
    expect(user.password).not.toEqual(userDataStandard.password);
  });

  it("should not be able to create a user if it already exists", async () => {
    await createUserUseCase.execute(userDataStandard);

    await expect(async () => {
      await createUserUseCase.execute(userDataStandard);
    }).rejects.toBeInstanceOf(AppError);
  });
});
