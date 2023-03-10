import { Vipps, VippsEcommerce, VippsEcommerceCaptureOrderProps } from '../src';
import { VippsExpressOrderProps } from '../src';
const dotenv = require('dotenv');
dotenv.config();

export const orderData: VippsExpressOrderProps = {
	merchantInfo: {
		paymentType: 'eComm Express Payment',
		shippingDetailsPrefix: 'DT-',
		staticShippingDetails: [
			{
				isDefault: 'Y',
				priority: 1,
				shippingCost: 90,
				shippingMethod: 'Bil',
				shippingMethodId: 'shippingMethodId1',
			},
			{
				isDefault: 'N',
				priority: 2,
				shippingCost: 200,
				shippingMethod: 'Sykkel',
				shippingMethodId: 'shippingMethodId2',
			},
		],
	},
	customerInfo: {
		mobileNumber: '93477559',
	},
	transaction: {
		amount: 100,
		orderId: Date.now().toString(),
		transactionText: 'Test',
		useExplicitCheckoutFlow: true,
	},
};

test('VippsEcommerce ChangeMSN', async () => {
	const vippsClient = await VippsEcommerce.getInstance('1234');
	expect(vippsClient.msn).toBe('1234');

	vippsClient.setMsn('229350');
	expect(vippsClient.msn).toBe('229350');

	vippsClient.setMsn('229351');
	expect(vippsClient.msn).toBe('229351');
});

test('VippsEcommerce MSN', async () => {
	const vipps = await VippsEcommerce.getInstance('1234');
	expect(vipps.msn).toBe('1234');
});

test('VippsEcommerce order', async () => {
	const vippsClient = await VippsEcommerce.getInstance();

	vippsClient.setOptions({
		callbackPrefix: 'https://gait-as-packages.herokuapp.com/api/vipps',
		consentRemovalPrefix: 'https://gait-as-packages.herokuapp.com/api/vipps',
		fallback: 'https://gait.no',
		merchantSerialNumber: '229350',
	});

	const order = await vippsClient.expressOrder(orderData);

	expect(order.orderId).toBe(orderData.transaction.orderId);
});

test('VippsEcommerce order details', async () => {
	const vippsClient = await VippsEcommerce.getInstance();
	const orderDetails = await vippsClient.getOrderDetails(orderData.transaction.orderId);

	expect(orderDetails.orderId).toBe(orderData.transaction.orderId);
});

test('VippsEcommerce manual authenticate', async () => {
	const vippsClient = new VippsEcommerce();
	vippsClient.config({
		clientId: process.env.VIPPS_CLIENT_ID,
		clientSecret: process.env.VIPPS_CLIENT_SECRET,
		subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY,
		merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER,
	});

	await vippsClient.authenticate();

	expect(vippsClient.authenticated).toBe(true);
});
