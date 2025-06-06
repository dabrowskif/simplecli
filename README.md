# @dabrowskif/simplecli

Simple CLI argument parser with full TypeScript support. So - it is typesafe. Aaand.. it is simple. Aaand... it works. Shocking? I know.

## Features

**Type Safety That Doesn't Lie**: CLI keys and JSON keys are fully typed and validated at compile time. No more mysterious runtime errors because you typo'd `--prot` instead of `--port` and spent 3 hours debugging why your server won't start.

**Duplicate Prevention**: Because apparently some people think passing `--verbose --verbose --verbose` makes things extra verbose. Spoiler alert: it doesn't.

**Flexible Parsing**: Supports both `--key=value` and `--key value` formats, because i am NOT monsters who force you into one arbitrary convention.

## Installation

```bash
npm install @dabrowskif/simplecli
```
or
```bash
yarn add @dabrowskif/simplecli
```

## Quick Start

```typescript
import { CLI } from '@dabrowskif/simplecli';

const args = new CLI()
  .addArg({
    cliKeys: ['--name', '-n'],
    jsonKey: 'name',
    required: true
  })
  .addArg({
    cliKeys: ['--age'],
    jsonKey: 'age',
    type: 'number'
  })
  .build();

// node script.js --name John --age 25
console.log(args.name); // string (guaranteed to exist)
console.log(args.age);  // number | undefined (properly typed)
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultType` | `'string' \| 'number' \| 'boolean'` | `'string'` | Default type for arguments when not specified. Because guessing is for amateurs. |
| `defaultRequired` | `boolean` | `false` | Makes all arguments required by default. Use with caution - your users will hate you. |
| `ignoreUnknownArgs` | `boolean` | `true` | Silently ignore unknown arguments. Set to `false` if you enjoy angry error messages. |
| `preventDuplicateArgs` | `boolean` | `true` | Prevents duplicate arguments. Turn off if you like chaos. |
| `explicitBooleanValues` | `boolean` | `false` | Requires explicit `true/false` values for booleans instead of just presence. For the pedantic. |

## API Reference

### Constructor
```typescript
new CLI()
```

### Methods

#### `.withOptions(options)`
Configure the CLI parser behavior.

```typescript
const cli = new CLI().withOptions({
  defaultType: 'string',
  defaultRequired: false,
  ignoreUnknownArgs: true,
  preventDuplicateArgs: true,
  explicitBooleanValues: false
});
```

#### `.withArgv(argv: string[])`
Set custom arguments to parse. Defaults to `process.argv.slice(2)` because that's what you want 99% of the time.

#### `.addArg(argument)`
Add an argument definition with full type safety.

```typescript
interface Argument {
  cliKeys: string[];                              // CLI flags: ['--name', '-n']
  jsonKey: string;                                // Result object key
  required?: boolean;                             // Override default requirement
  type?: 'string' | 'number' | 'boolean';       // Override default type
}
```

#### `.build()`
Parse the arguments and return a fully typed result object. This is where the magic happens.

## Examples

### Web Server Configuration
```typescript
const config = new CLI()
  .addArg({ cliKeys: ['--port', '-p'], jsonKey: 'port', type: 'number', required: true })
  .addArg({ cliKeys: ['--host'], jsonKey: 'host', required: true })
  .addArg({ cliKeys: ['--verbose'], jsonKey: 'verbose', type: 'boolean' })
  .build();

// node server.js --port 8080 --host localhost --verbose
// Result: { port: number, host: string, verbose?: boolean}
```

### Required by Default
```typescript
const config = new CLI()
  .withOptions({ defaultRequired: true })
  .addArg({ cliKeys: ['--database-url'], jsonKey: 'databaseUrl' })
  .addArg({ cliKeys: ['--dry-run'], jsonKey: 'dryRun', type: 'boolean', required: false })
  .build();

// node migrate.js --database-url "postgresql://..." --dry-run
// Result: { databaseUrl: string, dryRun?: boolean }
```

### Strict Mode with Explicit Booleans
```typescript
const config = new CLI()
  .withOptions({ 
    explicitBooleanValues: true,  // Requires --watch true/false
    ignoreUnknownArgs: true       // Throws on unknown args
  })
  .addArg({ cliKeys: ['--watch'], jsonKey: 'watch', type: 'boolean' })
  .addArg({ cliKeys: ['--workers'], jsonKey: 'workers', type: 'number' })
  .build();

// node build.js --watch true --workers 4
// Result: { watch?: boolean, workers?: number }

// node build.js --watch true --workers 4 --some-random-arg argvalue
// Result: throws an Error!
```
