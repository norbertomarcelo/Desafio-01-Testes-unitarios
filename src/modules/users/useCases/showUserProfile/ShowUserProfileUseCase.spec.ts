import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile Use Case", () => {
  let createUserUseCase: CreateUserUseCase;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  const userDataStandard: ICreateUserDTO = {
    name: "User Name",
    email: "email@email.com",
    password: "password",
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show specific user data", async () => {
    const user = await createUserUseCase.execute(userDataStandard);

    const response = await showUserProfileUseCase.execute(user.id ?? "");

    expect(response).toBeInstanceOf(User);
    expect(response).toHaveProperty("id");
    expect(response.id).toEqual(user.id);
    expect(response).toHaveProperty("name");
    expect(response.name).toEqual(user.name);
    expect(response).toHaveProperty("email");
    expect(response.email).toEqual(user.email);
    expect(response).toHaveProperty("password");
    expect(response.password).toEqual(user.password);
    expect(response.password).not.toEqual(userDataStandard.password);
  });

  it("should throw an error if the user was not found", async () => {
    await createUserUseCase.execute(userDataStandard);

    expect(async () => {
      const response = await showUserProfileUseCase.execute("");
    }).rejects.toThrow(ShowUserProfileError);
    expect(async () => {
      const response = await showUserProfileUseCase.execute("incorrectid");
    }).rejects.toThrow(ShowUserProfileError);
  });
});
