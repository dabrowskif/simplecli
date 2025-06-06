import { CLI } from '../../src';

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
