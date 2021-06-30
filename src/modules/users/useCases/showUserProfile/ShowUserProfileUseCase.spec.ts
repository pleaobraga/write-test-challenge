import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should not show profile when user does not exists", async () => {
    await expect(showUserProfileUseCase.execute("1")).rejects.toEqual(
      new ShowUserProfileError()
    );
  });

  it("should show profile when user exists", async () => {
    const userProps = {
      name: "name test",
      email: "email@g.com",
      password: "test",
    };

    const user = await usersRepository.create({ ...userProps });

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toEqual(user);
  });
});
