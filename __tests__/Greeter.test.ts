import { Greeter } from '../lib';

test('My Greeter', () => {
	expect(Greeter('Carl')).toBe('Hello Carl');
});
