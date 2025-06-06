import { CLI } from "../src";

const cli = new CLI()
  .addArg({
    cliKeys: ["-1"],
    jsonKey: "1",
    type: "number",
  })
  .addArg({
    cliKeys: ["-2"],
    jsonKey: "2",
    required: false,
  })
  .addArg({
    cliKeys: ["-3"],
    jsonKey: "3",
    type: "boolean",
    required: true,
  })
  .addArg({
    cliKeys: ["-4"],
    jsonKey: "4",
    type: "number",
    required: false,
  })
  .withOptions({
    defaultRequired: true,
    defaultType: "boolean",
  })
  .build();
