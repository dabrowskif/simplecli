import { describe, it, expect } from 'vitest';
import { CLI } from '../../src';

describe('CLI Parser', () => {
	it('should parse basic string arguments correctly', () => {
		const cli = new CLI()
			.withArgv(['--name', 'John', '--age', '30'])
			.addArg({
				cliKeys: ['--name'],
				jsonKey: 'name',
				required: true,
			})
			.addArg({
				cliKeys: ['--age'],
				jsonKey: 'age',
				type: 'number',
			});

		const result = cli.build();

		expect(result.name).toBe('John');
		expect(result.age).toBe(30);
		expect(typeof result.name).toBe('string');
		expect(typeof result.age).toBe('number');
	});

	it('should handle boolean flags correctly', () => {
		const cli = new CLI()
			.withArgv(['--verbose', '--debug'])
			.addArg({
				cliKeys: ['--verbose'],
				jsonKey: 'verbose',
				type: 'boolean',
			})
			.addArg({
				cliKeys: ['--debug'],
				jsonKey: 'debug',
				type: 'boolean',
			});

		const result = cli.build();

		expect(result.verbose).toBe(true);
		expect(result.debug).toBe(true);
	});

	it('should throw error for missing required arguments', () => {
		const cli = new CLI()
			.withArgv(['--optional', 'value'])
			.addArg({
				cliKeys: ['--required'],
				jsonKey: 'required',
				required: true,
			})
			.addArg({
				cliKeys: ['--optional'],
				jsonKey: 'optional',
			});

		expect(() => cli.build()).toThrow('Arg --required was not provided');
	});

	it('should handle key=value format correctly', () => {
		const cli = new CLI()
			.withArgv(['--port=8080', '--host=localhost', '--debug=false'])
			.addArg({
				cliKeys: ['--port'],
				jsonKey: 'port',
				type: 'number',
			})
			.addArg({
				cliKeys: ['--host'],
				jsonKey: 'host',
			})
			.addArg({
				cliKeys: ['--debug'],
				jsonKey: 'debug',
				type: 'boolean',
			});

		const result = cli.build();

		expect(result.port).toBe(8080);
		expect(result.host).toBe('localhost');
		expect(result.debug).toBe(false);
	});

	it('should throw error for invalid number format', () => {
		const cli = new CLI().withArgv(['--port', 'not-a-number']).addArg({
			cliKeys: ['--port'],
			jsonKey: 'port',
			type: 'number',
		});

		expect(() => cli.build()).toThrow('Arg --port should be number, but string (not-a-number) was provided.');
	});

	it('should throw error for invalid boolean format', () => {
		const cli = new CLI().withArgv(['--verbose=maybe']).addArg({
			cliKeys: ['--verbose'],
			jsonKey: 'verbose',
			type: 'boolean',
		});

		expect(() => cli.build()).toThrow('Arg --verbose should be boolean, but string (maybe) was provided.');
	});

	it('should handle short aliases correctly', () => {
		const cli = new CLI()
			.withArgv(['-p', '3000', '-v', '-h', 'example.com'])
			.addArg({
				cliKeys: ['--port', '-p'],
				jsonKey: 'port',
				type: 'number',
			})
			.addArg({
				cliKeys: ['--verbose', '-v'],
				jsonKey: 'verbose',
				type: 'boolean',
			})
			.addArg({
				cliKeys: ['--host', '-h'],
				jsonKey: 'host',
			});

		const result = cli.build();

		expect(result.port).toBe(3000);
		expect(result.verbose).toBe(true);
		expect(result.host).toBe('example.com');
	});

	it('should work with defaultRequired=true option', () => {
		const cli = new CLI()
			.withOptions({ defaultRequired: true })
			.withArgv(['--name', 'John', '--age', '30'])
			.addArg({
				cliKeys: ['--name'],
				jsonKey: 'name',
			})
			.addArg({
				cliKeys: ['--age'],
				jsonKey: 'age',
				type: 'number',
			})
			.addArg({
				cliKeys: ['--optional'],
				jsonKey: 'optional',
				required: false,
			});

		const result = cli.build();

		expect(result.name).toBe('John');
		expect(result.age).toBe(30);
		expect(result.optional).toBeUndefined();
	});

	it('should throw error when defaultRequired=true and arg missing', () => {
		const cli = new CLI()
			.withOptions({ defaultRequired: true })
			.withArgv(['--name', 'John'])
			.addArg({
				cliKeys: ['--name'],
				jsonKey: 'name',
			})
			.addArg({
				cliKeys: ['--required-by-default'],
				jsonKey: 'requiredByDefault',
			});

		expect(() => cli.build()).toThrow('Arg --required-by-default was not provided');
	});

	it('should throw error for duplicate arguments when preventDuplicateArgs=true', () => {
		const cli = new CLI()
			.withOptions({ preventDuplicateArgs: true })
			.withArgv(['--name', 'John', '--name', 'Jane'])
			.addArg({
				cliKeys: ['--name'],
				jsonKey: 'name',
			});

		expect(() => cli.build()).toThrow('Duplicate key name. Args must be unique.');
	});

	it('should throw error for unknown arguments when ignoreUnknownArgs=false', () => {
		const cli = new CLI()
			.withOptions({ ignoreUnknownArgs: false })
			.withArgv(['--known', 'value', '--unknown', 'oops'])
			.addArg({
				cliKeys: ['--known'],
				jsonKey: 'known',
			});

		expect(() => cli.build()).toThrow("Unknown arg --unknown. Ensure it's provided in CLI arguments.");
	});

	it('should ignore unknown arguments when ignoreUnknownArgs=true (default)', () => {
		const cli = new CLI().withArgv(['--known', 'value', '--unknown', 'ignored']).addArg({
			cliKeys: ['--known'],
			jsonKey: 'known',
		});

		const result = cli.build();

		expect(result.known).toBe('value');
		expect(result).not.toHaveProperty('unknown');
	});

	it('should handle explicitBooleanValues=true correctly', () => {
		const cli = new CLI()
			.withOptions({ explicitBooleanValues: true })
			.withArgv(['--verbose', 'true', '--debug', 'false'])
			.addArg({
				cliKeys: ['--verbose'],
				jsonKey: 'verbose',
				type: 'boolean',
			})
			.addArg({
				cliKeys: ['--debug'],
				jsonKey: 'debug',
				type: 'boolean',
			});

		const result = cli.build();

		expect(result.verbose).toBe(true);
		expect(result.debug).toBe(false);
	});

	it('should throw error when explicitBooleanValues=true but no value provided', () => {
		const cli = new CLI()
			.withOptions({ explicitBooleanValues: true })
			.withArgv(['--verbose'])
			.addArg({
				cliKeys: ['--verbose'],
				jsonKey: 'verbose',
				type: 'boolean',
			});

		expect(() => cli.build()).toThrow('Arg --verbose was provided without a value.');
	});

	it('should work with defaultType=number', () => {
		const cli = new CLI()
			.withOptions({ defaultType: 'number' })
			.withArgv(['--port', '8080', '--timeout', '5000'])
			.addArg({
				cliKeys: ['--port'],
				jsonKey: 'port',
			})
			.addArg({
				cliKeys: ['--timeout'],
				jsonKey: 'timeout',
			});

		const result = cli.build();

		expect(result.port).toBe(8080);
		expect(result.timeout).toBe(5000);
		expect(typeof result.port).toBe('number');
		expect(typeof result.timeout).toBe('number');
	});

	it('should throw error for arguments without dash prefix', () => {
		const cli = new CLI().withArgv(['name', 'John']).addArg({
			cliKeys: ['--name'],
			jsonKey: 'name',
		});

		expect(() => cli.build()).toThrow("Wrong arg formatting name. Arg should start with either '-' or '--'");
	});

	it('should handle complex mixed scenario', () => {
		const cli = new CLI()
			.withOptions({
				defaultType: 'string',
				defaultRequired: false,
				preventDuplicateArgs: true,
				// explicitBooleanValues: false,
			})
			.withArgv([
				'--database-url=postgresql://localhost:5432/test',
				'--port',
				'3000',
				'--workers',
				'4',
				'--verbose',
				'--dry-run=false',
				'-e',
				'production',
			])
			.addArg({
				cliKeys: ['--database-url'],
				jsonKey: 'databaseUrl',
				required: true,
			})
			.addArg({
				cliKeys: ['--port', '-p'],
				jsonKey: 'port',
				type: 'number',
			})
			.addArg({
				cliKeys: ['--workers'],
				jsonKey: 'workers',
				type: 'number',
			})
			.addArg({
				cliKeys: ['--verbose', '-v'],
				jsonKey: 'verbose',
				type: 'boolean',
			})
			.addArg({
				cliKeys: ['--dry-run'],
				jsonKey: 'dryRun',
				type: 'boolean',
			})
			.addArg({
				cliKeys: ['--environment', '-e'],
				jsonKey: 'environment',
			});

		const result = cli.build();

		expect(result.databaseUrl).toBe('postgresql://localhost:5432/test');
		expect(result.port).toBe(3000);
		expect(result.workers).toBe(4);
		expect(result.verbose).toBe(true);
		expect(result.dryRun).toBe(false);
		expect(result.environment).toBe('production');
	});
});
