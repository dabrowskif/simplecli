export type CLIOptions<
	DefaultType extends ArgumentType | undefined = undefined,
	DefaultRequired extends boolean | undefined = undefined,
> = {
	defaultType?: DefaultType;
	defaultRequired?: DefaultRequired;
	ignoreUnknownArgs?: boolean;
	preventDuplicateArgs?: boolean;
	explicitBooleanValues?: boolean;
};

export type Argument<
	CLIKeys extends CLIKey[],
	JsonKey extends string,
	Required extends boolean | undefined,
	Type extends ArgumentType | undefined,
> = {
	cliKeys: CLIKeys;
	jsonKey: JsonKey;
	required?: Required;
	type?: Type;
};

export type CLIKey = `-${string}` | `--${string}`;

export type ArgStore = Record<string, { cliKeys: CLIKey; type: ArgumentType; required: boolean }>;

export type UsedCLIKeys<S extends ArgStore> = S[keyof S]['cliKeys'][number];

export type ArgumentType = 'boolean' | 'number' | 'string';

export type InferArgumentType<Type extends ArgumentType, Required extends boolean> = TypeMap<Required>[Type];

export type TypeMap<Required extends boolean> = {
	boolean: Required extends true ? boolean : boolean | undefined;
	number: Required extends true ? number : number | undefined;
	string: Required extends true ? string : string | undefined;
};

export type Prettify<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

//START ToTuple helpers
type UnionToParam<U> = U extends unknown ? (k: U) => void : never;
type UnionToSect<U> = UnionToParam<U> extends (k: infer I) => void ? I : never;
type ExtractParam<F> = F extends (a: infer A) => void ? A : never;
type SpliceOne<Union> = Exclude<Union, ExtractOne<Union>>;
type ExtractOne<Union> = ExtractParam<UnionToSect<UnionToParam<Union>>>;
type ToTupleRec<Union, Res extends unknown[]> = SpliceOne<Union> extends never
	? [ExtractOne<Union>, ...Res]
	: ToTupleRec<SpliceOne<Union>, [ExtractOne<Union>, ...Res]>;
export type ToTuple<Union> = ToTupleRec<Union, []>;
//END ToTuple helpers
