import type { Argument, ArgumentType, CLIKey, CLIOptions, InferArgumentType, UsedCLIKeys } from './types';

const defaults: CLIOptions<'string', false> = {
	defaultType: 'string',
	defaultRequired: false,
	ignoreUnknownArgs: true,
	preventDuplicateArgs: true,
	explicitBooleanValues: false,
	// TODO: is as const needed?
} as const;

export class CLI<
	Opts extends Required<CLIOptions<ArgumentType, boolean>> = Required<
		CLIOptions<typeof defaults.defaultType, typeof defaults.defaultRequired>
	>,
	// biome-ignore lint/complexity/noBannedTypes: don't care
	ArgStore extends Record<string, { cliKeys: CLIKey; type: ArgumentType; required: boolean }> = {},
	OmittedKeys extends string = '',
> {
	private argv?: string[];
	private readonly args: Argument<CLIKey[], string, boolean | undefined, ArgumentType | undefined>[] = [];

	private opts: CLIOptions<ArgumentType, boolean> = defaults;

	withOptions<
		DefaultType extends ArgumentType | undefined = undefined,
		DefaultRequired extends boolean | undefined = undefined,
	>(opts: CLIOptions<DefaultType, DefaultRequired>) {
		for (const key in opts) {
			const tKey = key as keyof typeof opts;
			if (opts[tKey] !== undefined) {
				// biome-ignore lint/suspicious/noExplicitAny: FIXME:
				this.opts[tKey] = opts[tKey] as any;
			}
		}

		type NewDefaultType = DefaultType extends undefined ? Opts['defaultType'] : DefaultType;
		type NewDefaultRequired = DefaultRequired extends undefined ? Opts['defaultRequired'] : DefaultRequired;
		type NewOptions = Required<CLIOptions<NewDefaultType, NewDefaultRequired>>;
		type NewOmittedKeys = OmittedKeys | 'withOptions';
		type NewCli = CLI<NewOptions, ArgStore, NewOmittedKeys>;

		return this as Omit<NewCli, NewOmittedKeys>;
	}

	withArgv(argv: string[]) {
		this.argv = argv;
		type NewOmittedKeys = OmittedKeys | 'withArgv';
		return this as Omit<CLI<Opts, ArgStore, NewOmittedKeys>, NewOmittedKeys>;
	}

	addArg<
		CLIKeys extends CLIKey[],
		JsonKey extends string,
		Required extends boolean | undefined = undefined,
		Type extends ArgumentType | undefined = undefined,
	>(
		arg: Argument<
			CLIKeys[number] extends UsedCLIKeys<ArgStore> ? never : CLIKeys,
			JsonKey extends keyof ArgStore ? never : JsonKey,
			Required,
			Type
		>,
	) {
		this.args.push(arg);

		return this as CLI<
			Opts,
			ArgStore & {
				[K in JsonKey]: {
					cliKeys: CLIKeys;
					type: Type;
					required: Required;
				};
			},
			OmittedKeys
		>;
	}

	build() {
		const args = this.argv ?? process.argv.slice(2);
		const extractedArgs = this.extractArgs(args);

		// @TODO: extract to function
		// find first required arg that was not passed
		const requiredNotPassedArg = this.args
			.filter((arg) => arg.required === true || (arg.required === undefined && this.opts?.defaultRequired))
			.find((arg) => !extractedArgs.some((exArg) => arg.cliKeys.includes(exArg.key as CLIKey)));

		if (requiredNotPassedArg) {
			throw new Error(`Arg ${requiredNotPassedArg.cliKeys[0]} was not provided`);
		}

		const parsed = extractedArgs.map((a) => this.parseArg(a));

		const final = parsed.reduce<Record<string, unknown>>((acc, curr) => {
			if (curr) {
				if (acc[curr.key] !== undefined && this.opts?.preventDuplicateArgs) {
					throw new Error(`Duplicate key ${curr.key}. Args must be unique.`);
				}
				acc[curr.key] = curr.value;
			}
			return acc;
		}, {});

		return final as {
			[K in keyof ArgStore]: InferArgumentType<
				ArgStore[K]['type'] extends undefined ? Opts['defaultType'] : ArgStore[K]['type'],
				ArgStore[K]['required'] extends undefined ? Opts['defaultRequired'] : ArgStore[K]['required']
			>;
		};
	}

	private extractArgs(args: string[]) {
		const parsed: {
			key: string;
			value: string;
		}[] = [];

		while (args.length > 0) {
			const arg = args.shift() as string;

			if (!arg.startsWith('-')) {
				throw new Error(`Wrong arg formatting ${arg}. Arg should start with either '-' or '--'`);
			}

			// handle arg that has "--key=value" format
			if (arg.includes('=')) {
				const separatorIdx = arg.indexOf('=');
				const key = arg.slice(0, separatorIdx);
				const value = arg.slice(separatorIdx + 1, arg.length);

				parsed.push({
					key,
					value,
				});
			} else {
				const matchingArg = this.args.find((a) => a.cliKeys.includes(arg as CLIKey));

				let isBoolean = false;
				if (matchingArg?.type === 'boolean' || (!matchingArg?.type && this.opts.defaultType === 'boolean')) {
					isBoolean = true;
				}

				const value = (() => {
					// if boolean, we support '--my-bool --my-other-string value'
					if (isBoolean) {
						// if explicitBooleanValues, require '--my-bool true/false'
						if (this.opts.explicitBooleanValues) {
							return args.shift();
						}
						return 'true';
					}

					// if "--key value" format, we have to get next object from the list because it is arg value
					return args.shift();
				})();

				// throw if no value or "--key1 --key2=value" was passed
				// if (value === undefined || value.startsWith('-')) {
				if (value === undefined) {
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
		const argInput = this.args.find((a) => a.cliKeys.includes(arg.key as CLIKey));

		if (argInput) {
			const value = (() => {
				const type = argInput.type ?? this.opts?.defaultType;

				switch (type) {
					case 'string':
						return arg.value as string;

					case 'number': {
						const numValue = Number(arg.value);
						if (Number.isNaN(numValue)) {
							throw new Error(`Arg ${arg.key} should be number, but ${typeof arg.value} (${arg.value}) was provided.`);
						}
						return numValue;
					}

					case 'boolean':
						if (arg.value === 'true') {
							return true;
						}
						if (arg.value === 'false') {
							return false;
						}
						throw new Error(`Arg ${arg.key} should be boolean, but ${typeof arg.value} (${arg.value}) was provided.`);
				}
			})();

			return {
				key: argInput.jsonKey,
				value,
			};
		}

		if (!this.opts?.ignoreUnknownArgs && !argInput) {
			throw new Error(`Unknown arg ${arg.key}. Ensure it's provided in CLI arguments.`);
		}

		return null;
	}
}
