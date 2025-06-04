import { type ArgumentInput, CLI } from '../src';

const args: ArgumentInput[] = [
	{ cliKeys: ['--hello', '-h'], jsonKey: 'hello', type: 'number' },
	{ cliKeys: ['--world', '-w'], jsonKey: 'world', type: 'bool' },
];
const cli = new CLI(args);
cli.run();
