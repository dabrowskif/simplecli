# @dabrowskif/simplecli

Simple CLI argument parser with full TypeScript support.

## Installation

```bash
npm install @dabrowskif/simplecli
```

## Usage

```typescript
import { CLI } from '@dabrowskif/simplecli';

const args = new CLI()
  .withArgv(process.argv.slice(2)) // Optional - defaults to process.argv.slice(2)
  .addArg({
    cliKeys: ['--name', '-n'],
    jsonKey: 'name',
    type: 'string',
    required: true
  })
  .addArg({
    cliKeys: ['--age'],
    jsonKey: 'age',
    type: 'number'
  })
  .build();

// node script.js --name John --age 25
// Fully typed result
console.log(args.name); // string
console.log(args.age);  // number | undefined
```

## API

### Constructor
```typescript
new CLI()
```

### Methods

#### `.withOptions(options)`
```typescript
interface CLIOptions {
  defaultType?: 'string' | 'number' | 'boolean';
  defaultRequired?: boolean;
  ignoreUnknownArgs?: boolean;
  preventDuplicateArgs?: boolean;
}
```

#### `.withArgv(argv: string[])`
Set arguments to parse. Optional - defaults to `process.argv.slice(2)`.

#### `.addArg(argument)`
```typescript
interface Argument {
  cliKeys: string[];          // ['--name', '-n']
  jsonKey: string;            // Key in result object
  required?: boolean;         // Override default
  type?: 'string' | 'number' | 'boolean';
}
```

#### `.build()`
Parse arguments and return typed result.

## Supported Formats

```bash
# Both formats work
--key=value
--key value
```

## Example

```typescript
const config = new CLI()
  .withArgv(process.argv.slice(2)) // Optional
  .withOptions({
    defaultType: 'string',
    defaultRequired: false
  })
  .addArg({
    cliKeys: ['--port', '-p'],
    jsonKey: 'port',
    type: 'number'
  })
  .addArg({
    cliKeys: ['--verbose'],
    jsonKey: 'verbose',
    type: 'boolean'
  })
  .build();

// node script.js --port 8080 --verbose
// Type-safe access
const port = config.port ?? 3000;
if (config.verbose) console.log('Verbose mode');
```

## License

MIT
