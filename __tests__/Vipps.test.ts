import { Vipps } from '../src';
const dotenv = require('dotenv');
dotenv.config();

test('Vipps authenticate', async () => {
	const vippsClient = new Vipps();
	await vippsClient.authenticate();

	expect(vippsClient).toBeDefined();
});

test('Vipps manual authentication', async () => {
	const vipps = new Vipps();
	await vipps.authenticate({
		clientId: process.env.VIPPS_CLIENT_ID,
		clientSecret: process.env.VIPPS_CLIENT_SECRET,
		subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY,
		merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER,
	});

	expect(vipps.authenticated).toBe(true);
});

test('Vipps MSN', () => {
	const vipps = new Vipps();
	vipps.setMsn('229350');

	expect(vipps.msn).toBe('229350');
});

test('Vipps token', async () => {
	const vipps = new Vipps();

	await vipps.authenticate();
	const token = vipps.token;
	expect(token).toBeDefined();

	vipps.removeToken();
	expect(vipps.token.accessToken && vipps.token.accessTokenExpiresAt).toBeUndefined();

	await vipps.authenticate();
	expect(vipps.authenticated).toBe(true);
	expect(vipps.api).toBeDefined();

	vipps.setToken({
		accessTokenExpiresAt: 123123,
	});
	expect(vipps.api).toBeDefined();
});

// Class Verify
// Method generate code
// Method for verifying code

// Class Sms extends Verify
// API for SMS

// Class Email extends Verify
// API for Email
