import axios from 'axios';
import {
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
	private VIPPS_API_URL = process.env.VIPPS_API_URL;
	private VIPPS_CLIENT_ID: string | undefined;
	private VIPPS_CLIENT_SECRET: string | undefined;
	private VIPPS_SUBSCRIPTION_KEY: string | undefined;

	private accessToken: string | undefined;
	private accessTokenExpiresAt: number | undefined;
	private merchantSerialNumber: string | undefined;

	constructor() {
		this.VIPPS_API_URL = process.env.VIPPS_API_URL;
		this.VIPPS_CLIENT_ID = process.env.VIPPS_CLIENT_ID;
		this.VIPPS_CLIENT_SECRET = process.env.VIPPS_CLIENT_SECRET;
		this.VIPPS_SUBSCRIPTION_KEY = process.env.VIPPS_SUBSCRIPTION_KEY;

		this.authenticate();
	}

	config({ clientId, clientSecret, subscriptionKey, merchantSerialNumber }: VippsConstructorOptions) {
		this.VIPPS_CLIENT_ID = clientId;
		this.VIPPS_CLIENT_SECRET = clientSecret;
		this.VIPPS_SUBSCRIPTION_KEY = subscriptionKey;
		this.merchantSerialNumber = merchantSerialNumber;
	}

	async authenticate(props?: VippsConstructorOptions) {
		if (props) {
			this.config(props);
		}

		if (!this.VIPPS_CLIENT_ID || !this.VIPPS_CLIENT_SECRET || !this.VIPPS_SUBSCRIPTION_KEY) {
			throw new Error(
				'Missing credentials. Set credentials with config() or set VIPPS_CLIENT_ID, VIPPS_CLIENT_SECRET and VIPPS_SUBSCRIPTION_KEY as environment variables.'
			);
		}

		return await axios
			.post(
				'/accessToken/get',
				{},
				{
					baseURL: process.env.VIPPS_API_URL,
					headers: {
						'Content-Type': 'application/json',
						client_id: this.VIPPS_CLIENT_ID,
						client_secret: this.VIPPS_CLIENT_SECRET,
						'Ocp-Apim-Subscription-Key': this.VIPPS_SUBSCRIPTION_KEY,
					},
				}
			)
			.then((response) => {
				this.accessToken = response.data.access_token;
				this.accessTokenExpiresAt = response.data.expires_on;
				return {
					accessToken: this.accessToken,
					accessTokenExpiresAt: this.accessTokenExpiresAt,
				};
			});
	}

	setMsn(merchantSerialNumber: string) {
		this.merchantSerialNumber = merchantSerialNumber;
	}

	setToken({ accessToken, accessTokenExpiresAt }: { accessToken?: string; accessTokenExpiresAt?: number }) {
		this.accessToken = accessToken || this.accessToken;
		this.accessTokenExpiresAt = accessTokenExpiresAt || this.accessTokenExpiresAt;
	}

	removeToken() {
		this.accessToken = undefined;
		this.accessTokenExpiresAt = undefined;
	}

	get authenticated() {
		return !!this.accessToken;
	}

	get msn() {
		return this.merchantSerialNumber;
	}

	get api() {
		if (!this.accessToken || !this.accessTokenExpiresAt) {
			throw new Error('No access token. Call getAccessToken first.');
		}

		if (Date.now() / 1000 > this.accessTokenExpiresAt) {
			this.authenticate().then((res) => {
				this.accessTokenExpiresAt = res.accessTokenExpiresAt;
				this.accessToken = res.accessToken;

				return axios.create({
					baseURL: process.env.VIPPS_API_URL,
					headers: {
						'Content-Type': 'application/json',
						'Ocp-Apim-Subscription-Key': this.VIPPS_SUBSCRIPTION_KEY,
						Authorization: `Bearer ${res.accessToken}`,
						'Merchant-Serial-Number': this.merchantSerialNumber,
						'Vipps-System-Name': process.env.VIPPS_SYSTEM_NAME || 'gait-vipps',
					},
				});
			});
		}

		return axios.create({
			baseURL: process.env.VIPPS_API_URL,
			headers: {
				'Content-Type': 'application/json',
				'Ocp-Apim-Subscription-Key': this.VIPPS_SUBSCRIPTION_KEY,
				Authorization: `Bearer ${this.accessToken}`,
				'Merchant-Serial-Number': this.merchantSerialNumber,
				'Vipps-System-Name': process.env.VIPPS_SYSTEM_NAME || 'gait-vipps',
			},
		});
	}

	get token() {
		return {
			accessToken: this.accessToken,
			accessTokenExpiresAt: this.accessTokenExpiresAt,
		};
	}
}

export class VippsEcommerce extends Vipps {
	private callbackPrefix: string | undefined;
	private consentRemovalPrefix: string | undefined;
	private fallBack: string | undefined;
	private static instance: VippsEcommerce;

	constructor(merchantSerialNumber?: string) {
		super();

		if (merchantSerialNumber) {
			this.setMsn(merchantSerialNumber);
		}
	}

	public static getInstance = async (MSN?: string) => {
		if (!VippsEcommerce.instance) {
			VippsEcommerce.instance = new VippsEcommerce();

			if (MSN) {
				VippsEcommerce.instance.setMsn(MSN);
			}

			await VippsEcommerce.instance.authenticate();
		}

		if (MSN && MSN !== VippsEcommerce.instance.msn) {
			VippsEcommerce.instance.setMsn(MSN);
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
