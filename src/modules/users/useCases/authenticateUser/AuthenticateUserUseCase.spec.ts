import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

describe("Authenticate User Use Case", () => {
  let createUserUseCase: CreateUserUseCase;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  const userDataStandard: ICreateUserDTO = {
    name: "User Name",
    email: "email@email.com",
    password: "password123",
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("shoud be able to authenticate a user", async () => {
    await createUserUseCase.execute(userDataStandard);

    const loggedUser = await authenticateUserUseCase.execute({
      email: userDataStandard.email,
      password: userDataStandard.password,
    });

    expect(loggedUser).toHaveProperty("user.id");
    expect(loggedUser).toHaveProperty("user.name");
    expect(loggedUser.user.name).toEqual(userDataStandard.name);
    expect(loggedUser).toHaveProperty("user.email");
    expect(loggedUser.user.email).toEqual(userDataStandard.email);
    expect(loggedUser).toHaveProperty("token");
    expect(loggedUser).not.toHaveProperty("password");
  });

  it("should not be able login if email is incorrect", async () => {
    await createUserUseCase.execute(userDataStandard);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "email_incorrect@email.com",
        password: userDataStandard.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able login if password is incorrect", async () => {
    await createUserUseCase.execute(userDataStandard);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: userDataStandard.email,
        password: "passwod.incorrect",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
