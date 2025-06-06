export type CLIOptions<
	DefaultType extends ArgumentType | undefined = undefined,
	DefaultRequired extends boolean | undefined = undefined,
> = {
	defaultType?: DefaultType;
	defaultRequired?: DefaultRequired;
	ignoreUnknownArgs?: boolean;
	preventDuplicateArgs?: boolean;
};

export type Argument<
	CliKeys extends string[],
	JsonKey extends string,
	Required extends boolean | undefined,
	Type extends ArgumentType | undefined,
> = {
	cliKeys: CliKeys;
	jsonKey: JsonKey;
	required?: Required;
	type?: Type;
};

export type ArgumentType = 'boolean' | 'number' | 'string';

export type InferArgumentType<Type extends ArgumentType, Required extends boolean> = TypeMap<Required>[Type];

export type TypeMap<Required extends boolean> = {
	boolean: Required extends true ? boolean : boolean | undefined;
	number: Required extends true ? number : number | undefined;
	string: Required extends true ? string : string | undefined;
};

export type Prettify<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
