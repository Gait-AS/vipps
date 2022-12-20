import axios from 'axios';
import {
	AuthenticateOptions,
	VippsExpressOrderProps,
	VippsConstructorOptions,
	VippsEcommerceConstructorOptions,
	VippsExpressOrderResponse,
	VippsExpressOrderDetailsResponse,
	VippsEcommerceCaptureOrderProps,
} from './types/vipps';

const dotenv = require('dotenv');
dotenv.config();

export class Vipps {
	private readonly SUBSCRIPTION_KEY: string | undefined;
	private accessToken: string | undefined;
	private merchantSerialNumber: string | undefined;

	constructor({ subscriptionKey, authToken }: VippsConstructorOptions) {
		this.SUBSCRIPTION_KEY = subscriptionKey || process.env.VIPPS_SUBSCRIPTION_KEY;
		this.accessToken = authToken;
	}

	async authenticate({ clientId, clientSecret, subscriptionKey }: AuthenticateOptions) {
		if (!clientId || !clientSecret || !subscriptionKey) {
			try {
				clientId = process.env.VIPPS_CLIENT_ID;
				clientSecret = process.env.VIPPS_CLIENT_SECRET;
				subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
			} catch (error) {
				throw new Error(
					'Missing credentials. Provide clientId, clientSecret and subscriptionKey, or set them as environment variables.'
				);
			}
		}

		return await axios
			.post(
				'/accessToken/get',
				{},
				{
					baseURL: process.env.VIPPS_API_URL,
					headers: {
						'Content-Type': 'application/json',
						client_id: clientId,
						client_secret: clientSecret,
						'Ocp-Apim-Subscription-Key': subscriptionKey,
					},
				}
			)
			.then((response) => {
				this.accessToken = response.data.access_token;
				return response.data.access_token;
			});
	}

	setMsn(merchantSerialNumber: string) {
		this.merchantSerialNumber = merchantSerialNumber;
	}

	get msn() {
		return this.merchantSerialNumber;
	}

	get api() {
		if (!this.accessToken) {
			throw new Error('No access token. Call getAccessToken first.');
		}

		return axios.create({
			baseURL: process.env.VIPPS_API_URL,
			headers: {
				'Content-Type': 'application/json',
				'Ocp-Apim-Subscription-Key': this.SUBSCRIPTION_KEY,
				Authorization: `Bearer ${this.accessToken}`,
				'Merchant-Serial-Number': this.merchantSerialNumber,
				'Vipps-System-Name': process.env.VIPPS_SYSTEM_NAME || 'gait-vipps',
			},
		});
	}

	get token() {
		return this.accessToken;
	}
}

export class VippsEcommerce extends Vipps {
	private callbackPrefix: string | undefined;
	private consentRemovalPrefix: string | undefined;
	private fallBack: string | undefined;
	private static instance: VippsEcommerce;

	constructor(options: VippsConstructorOptions, merchantSerialNumber?: string) {
		super(options);

		if (merchantSerialNumber) {
			this.setMsn(merchantSerialNumber);
		}
	}

	public static getInstance = async (MSN?: string) => {
		if (!VippsEcommerce.instance) {
			VippsEcommerce.instance = new VippsEcommerce({});

			if (MSN) {
				VippsEcommerce.instance.setMsn(MSN);
			}

			await VippsEcommerce.instance.authenticate({});
		}

		return VippsEcommerce.instance;
	};

	setOptions({ ...options }: VippsEcommerceConstructorOptions) {
		this.callbackPrefix = options.callbackPrefix;
		this.consentRemovalPrefix = options.consentRemovalPrefix;
		this.fallBack = options.fallback;
		this.setMsn(options.merchantSerialNumber);
	}

	expressOrder(order: VippsExpressOrderProps): Promise<VippsExpressOrderResponse> {
		return new Promise((resolve, reject) => {
			this.api
				.post('/ecomm/v2/payments', {
					merchantInfo: {
						callbackPrefix: this.callbackPrefix,
						consentRemovalPrefix: this.consentRemovalPrefix,
						fallBack: this.fallBack,
						merchantSerialNumber: this.msn,
						paymentType: order.merchantInfo.paymentType,
						shippingDetailsPrefix: order.merchantInfo.shippingDetailsPrefix,
						staticShippingDetails: order.merchantInfo.staticShippingDetails,
					},
					customerInfo: {
						mobileNumber: order.customerInfo.mobileNumber,
					},
					transaction: {
						amount: order.transaction.amount,
						orderId: order.transaction.orderId,
						transactionText: order.transaction.transactionText,
						useExplicitCheckoutFlow: order.transaction.useExplicitCheckoutFlow,
					},
				})
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error.response.data);
				});
		});
	}

	getOrderDetails(orderId: string): Promise<VippsExpressOrderDetailsResponse> {
		return new Promise((resolve, reject) => {
			this.api
				.get(`/ecomm/v2/payments/${orderId}/details`)
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error.response.data);
				});
		});
	}

	captureOrder(captureOrderProps: VippsEcommerceCaptureOrderProps): Promise<any> {
		return new Promise((resolve, reject) => {
			this.api
				.post(
					`/ecomm/v2/payments/${captureOrderProps.orderId}/capture`,
					{
						merchantInfo: {
							merchantSerialNumber: this.msn,
						},
						transaction: {
							transactionText: captureOrderProps.transactionText,
						},
					},
					{
						headers: {
							'X-Request-Id': captureOrderProps.orderId,
						},
					}
				)
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error.response.data);
				});
		});
	}
}
