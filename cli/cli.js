const { program } = require("commander");
const fs = require("fs");
const sub = require("../lib/sub");

program
  .command("create_account <name> <password> <output>")
  //.option("-o, --output", "Output path")
  .action(function (name, password, output, cmdObj) {
    console.log(`creating account: ${name} ${password} ${output} `);
    try {
      const result = sub.newAccount(name, password);
      // write to output json
      fs.writeFileSync(
        `${output}/${result.json.address}.json`,
        JSON.stringify(result)
      );
    } catch (e) {
      console.error(e);
    }
  });

// TODO
sub.initKeyring().then(() => {
  console.log("init keyring done!");
  program.parse(process.argv);
});
