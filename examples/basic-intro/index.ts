import { type Config, loadFromPath } from "./generated/config.pkl";

const main = async () => {
  const config: Config = await loadFromPath("config.pkl");
  console.log(
    `Hello, ${config.firstName} ${config.lastName}! I hear you are ${config.age} years old.`
  );
};

main();
