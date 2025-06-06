import {
  ArgumentType,
  Argument,
  CLIOptions,
  Prettify,
  InferArgumentType,
} from "./types";

const defaults: CLIOptions<"string", true> = {
  defaultType: "string",
  defaultRequired: true,
  ignoreUnknownArgs: false,
  preventDuplicateArgs: true,
} as const;

export class CLI<
  Opts extends Required<
    CLIOptions<typeof defaults.defaultType, typeof defaults.defaultRequired>
  >,
  ArgStore = {},
  Out = {},
> {
  private readonly args: Argument<
    string[],
    string,
    boolean | undefined,
    ArgumentType | undefined
  >[] = [];

  private opts: CLIOptions<ArgumentType, boolean> = defaults;

  withOptions<T extends ArgumentType, V extends boolean>(
    opts: CLIOptions<T, V>,
  ) {
    this.opts = {
      ...this.opts,
      ...opts,
    };

    return this;
  }

  addArg<
    CliKeys extends string[],
    JsonKey extends string,
    Required extends boolean | undefined = undefined,
    Type extends ArgumentType | undefined = undefined,
  >(arg: Argument<CliKeys, JsonKey, Required, Type>) {
    this.args.push(arg);

    return this as CLI<
      Opts,
      ArgStore,
      Prettify<
        Out & {
          [K in JsonKey]: InferArgumentType<
            Type extends undefined ? "string" : Type,
            Required extends undefined ? Opts["defaultRequired"] : Required
          >;
        }
      >
    >;
  }

  build() {
    const args = process.argv.slice(2);
    const extractedArgs = this.extractArgs(args);

    // @TODO: extract to function
    // find first required arg that was not passed
    const requiredNotPassedArg = this.args
      .filter(
        (arg) =>
          arg.required === true ||
          (arg.required === undefined && this.opts?.defaultRequired),
      )
      .find(
        (arg) =>
          !extractedArgs.some((exArg) => arg.cliKeys.includes(exArg.key)),
      );

    if (requiredNotPassedArg) {
      throw new Error(
        `Arg ${requiredNotPassedArg.cliKeys[0]} was not provided`,
      );
    }

    const parsed = extractedArgs.map((a) => this.parseArg(a));

    return parsed.reduce<Record<string, unknown>>((acc, curr) => {
      if (curr) {
        if (acc[curr.key] !== undefined && this.opts?.preventDuplicateArgs) {
          throw new Error(`Duplicate key ${curr.key}. Args must be unique.`);
        }
        acc[curr.key] = curr.value;
      }
      return acc;
    }, {}) as Out;
  }

  private extractArgs(args: string[]) {
    const parsed: {
      key: string;
      value: string;
    }[] = [];

    while (args.length > 0) {
      const arg = args.shift() as string;

      if (!arg.startsWith("-")) {
        throw new Error(
          `Wrong arg formatting ${arg}. Arg should start with either '-' or '--'`,
        );
      }

      // handle arg that has "--key=value" format
      if (arg.includes("=")) {
        const separatorIdx = arg.indexOf("=");
        const key = arg.slice(0, separatorIdx);
        const value = arg.slice(separatorIdx + 1, arg.length);

        parsed.push({
          key,
          value,
        });
      } else {
        // if "--key value" format, we have to get next object from the list because it is arg value
        const value = args.shift();

        // throw if no value or "--key1 --key2=value" was passed
        if (value === undefined || value.startsWith("-")) {
          throw new Error(`Arg ${arg} was provided without a value.`);
        }

        parsed.push({
          key: arg,
          value,
        });
      }
    }

    return parsed;
  }

  private parseArg(arg: { key: string; value: string }) {
    const argInput = this.args.find((a) => a.cliKeys.includes(arg.key));

    if (argInput) {
      const value = (() => {
        const type = argInput.type ?? this.opts?.defaultType;

        switch (type) {
          case "string":
            return arg.value as string;

          case "number": {
            const numValue = Number(arg.value);
            if (Number.isNaN(numValue)) {
              throw new Error(
                `Arg ${arg.key} should be number, but ${arg.value} was provided.`,
              );
            }
            return numValue;
          }

          case "boolean":
            if (arg.value === "true") {
              return true;
            }
            if (arg.value === "false") {
              return false;
            }
            throw new Error(
              `Arg ${arg.key} should be boolean, but ${arg.value} was provided.`,
            );
        }
      })();

      return {
        key: argInput.jsonKey,
        value,
      };
    }

    if (!this.opts?.ignoreUnknownArgs && !argInput) {
      throw new Error(
        `Unknown arg ${arg.key}. Ensure it's provided in CLI arguments.`,
      );
    }

    return null;
  }
}
