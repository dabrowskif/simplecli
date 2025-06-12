import { describe, expect, it } from 'vitest';
import { CLI } from '.';

describe('CLI Parser', () => {
	describe('default options', () => {
		describe('defaultType', () => {
			it('should set string on one arg', () => {
				const cli = new CLI().withArgv(['--k1', 'k1val']).addArg({
					cliKeys: ['--k1'],
					jsonKey: 'k1',
				});

				const { k1 } = cli.build();

				expect(typeof k1).toEqual('string');
			});

			it('should set string on all args', () => {
				const cli = new CLI()
					.withArgv(['--k1', 'k1v', '--k2', 'k2v', '--k3', 'k3v'])
					.addArg({
						cliKeys: ['--k1'],
						jsonKey: 'k1',
					})
					.addArg({
						cliKeys: ['--k2'],
						jsonKey: 'k2',
					})
					.addArg({
						cliKeys: ['--k3'],
						jsonKey: 'k3',
					});

				const { k1, k2, k3 } = cli.build();

				expect(typeof k1).toEqual('string');
				expect(typeof k2).toEqual('string');
				expect(typeof k3).toEqual('string');
			});

			it('should not set defaultType if type is specified', () => {
				const cli = new CLI()
					.withArgv(['--k1', '--k2', '2'])
					.addArg({
						cliKeys: ['--k1'],
						jsonKey: 'k1',
						type: 'boolean',
					})
					.addArg({
						cliKeys: ['--k2'],
						jsonKey: 'k2',
						type: 'number',
					});

				const { k1, k2 } = cli.build();

				expect(typeof k1).toEqual('boolean');
				expect(typeof k2).toEqual('number');
			});
		});

		describe('defaultRequired', () => {
			it('should not throw if argument was not provided', () => {
				const cli = new CLI().withArgv([]).addArg({
					cliKeys: ['--name'],
					jsonKey: 'name',
				});

				expect(() => cli.build()).not.toThrow();
			});

			it('should not throw if all argument were not provided', () => {
				const cli = new CLI()
					.withArgv([])
					.addArg({
						cliKeys: ['--k1'],
						jsonKey: 'k1',
					})
					.addArg({
						cliKeys: ['--k2'],
						jsonKey: 'k2',
					})
					.addArg({
						cliKeys: ['--k3'],
						jsonKey: 'k3',
					});

				expect(() => cli.build()).not.toThrow();
			});
		});

		describe('ignoreUnknownArgs', () => {
			it('should not throw if unknown arg was provided', () => {
				const cli = new CLI().withArgv(['--kv1', 'v1']).addArg({
					cliKeys: ['--k2'],
					jsonKey: 'k2',
				});

				expect(() => cli.build()).not.toThrow();
			});

			it('should not throw if many unknown arg was provided', () => {
				const cli = new CLI().withArgv(['--kv1', 'v1', '--kv2', 'v2']).addArg({
					cliKeys: ['--known'],
					jsonKey: 'known',
				});

				expect(() => cli.build()).not.toThrow();
			});
		});

		describe('preventDuplicateArgs', () => {
			it('should throw if duplicated arg was provided', () => {
				const cli = new CLI().withArgv(['--k1', 'v1', '--k1', 'v2']).addArg({
					cliKeys: ['--k1'],
					jsonKey: 'k1',
				});

				expect(() => cli.build()).toThrow();
			});
		});

		describe('explicitBooleanValues', () => {
			it('should not throw if boolean was provided without a value', () => {
				const cli = new CLI().withArgv(['--k1']).addArg({
					cliKeys: ['--k1'],
					jsonKey: 'v1',
					type: 'boolean',
				});

				expect(() => cli.build()).not.toThrow();
			});

			it('should not throw if many boolean was provided without a value', () => {
				const cli = new CLI()
					.withArgv(['--k1', '--k2', '--k3'])
					.addArg({
						cliKeys: ['--k1'],
						jsonKey: 'v1',
						type: 'boolean',
					})
					.addArg({
						cliKeys: ['--k2'],
						jsonKey: 'v2',
						type: 'boolean',
					})
					.addArg({
						cliKeys: ['--k3'],
						jsonKey: 'v3',
						type: 'boolean',
					});

				expect(() => cli.build()).not.toThrow();
			});
		});
	});

	describe('specific options', () => {
		describe('defaultType', () => {
			it('should set string properly', () => {
				const cli = new CLI()
					.withArgv(['--key', 'value'])
					.withOptions({ defaultType: 'string' })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
					});

				const { key } = cli.build();
				expect(typeof key).toEqual('string');
			});

			it('should set number properly', () => {
				const cli = new CLI()
					.withArgv(['--key', '0'])
					.withOptions({ defaultType: 'number' })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
					});

				const { key } = cli.build();
				expect(typeof key).toEqual('number');
			});

			it('should set boolean properly', () => {
				const cli = new CLI()
					.withArgv(['--key'])
					.withOptions({ defaultType: 'boolean' })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
					});

				const { key } = cli.build();
				expect(typeof key).toEqual('boolean');
			});
		});

		describe('defaultRequired', () => {
			it('should throw if arg was not passed and defaultRequired is true', () => {
				const cli = new CLI()
					.withArgv([])
					.withOptions({ defaultRequired: true })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
					});

				expect(() => cli.build()).toThrow('not provided');
			});

			it('should not throw if arg was not passed and defaultRequired is false', () => {
				const cli = new CLI()
					.withArgv([])
					.withOptions({ defaultRequired: false })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
					});

				expect(() => cli.build()).not.toThrow();
			});
		});

		describe('ignoreUnknownArgs', () => {
			it('should throw if unknown arg was passed and ignoreUnknownArgs is false', () => {
				const cli = new CLI()
					// TODO: fix - so that unknown key is omitted if no value
					.withArgv(['--unknown-key', 'value'])
					.withOptions({ ignoreUnknownArgs: false })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
						required: false,
					});

				expect(() => cli.build()).toThrow('Unknown arg');
			});

			it('should not throw if arg was not passed and ignoreUnknownArgs is true', () => {
				const cli = new CLI()
					.withArgv(['--unknown-key', 'value'])
					.withOptions({ ignoreUnknownArgs: true })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
						required: false,
					});

				expect(() => cli.build()).not.toThrow();
			});
		});

		describe('preventDuplicateArgs', () => {
			it('should throw if arg was passed twice and preventDuplicateArgs is true', () => {
				const cli = new CLI()
					.withArgv(['--key', 'value', '--key', 'value'])
					.withOptions({ preventDuplicateArgs: true })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
						required: false,
					});

				expect(() => cli.build()).toThrow('Duplicate key');
			});

			it('should not throw if arg was passed twice and preventDuplicateArgs is false', () => {
				const cli = new CLI()
					.withArgv(['--key', 'value', '--key', 'value'])
					.withOptions({ preventDuplicateArgs: false })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
						required: false,
					});

				expect(() => cli.build()).not.toThrow();
			});
		});

		describe('explicitBooleanValues', () => {
			it('should handle non-explicit boolean values if explicitBooleanValues is false', () => {
				const cli = new CLI()
					.withArgv(['--key'])
					.withOptions({ explicitBooleanValues: false })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
						type: 'boolean',
					});

				expect(() => cli.build()).not.toThrow();
			});

			it('should handle explicit boolean values if explicitBooleanValues is true', () => {
				const cli = new CLI()
					.withArgv(['--key', 'true'])
					.withOptions({ explicitBooleanValues: true })
					.addArg({
						cliKeys: ['--key'],
						jsonKey: 'key',
						type: 'boolean',
					});

				expect(() => cli.build()).not.toThrow();
			});
		});
	});

	describe('complex scenarios', () => {
		it('should handle properly', () => {
			const cli = new CLI()
				.withOptions({
					defaultType: 'string',
					defaultRequired: false,
					preventDuplicateArgs: true,
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
});
