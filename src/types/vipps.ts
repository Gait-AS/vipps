export interface VippsConstructorOptions {
	clientId?: string;
	clientSecret?: string;
	subscriptionKey?: string;
	authToken?: string;
}

export interface VippsEcommerceConstructorOptions {
	callbackPrefix: string;
	consentRemovalPrefix: string;
	fallback?: string;
	merchantSerialNumber: string;
}

export interface AuthenticateOptions {
	clientId?: string;
	clientSecret?: string;
	subscriptionKey?: string;
}

export interface VippsExpressOrderProps {
	merchantInfo: {
		paymentType: string;
		shippingDetailsPrefix: string;
		staticShippingDetails: {
			isDefault: string;
			priority: number;
			shippingCost: number;
			shippingMethod: string;
			shippingMethodId: string;
		}[];
	};
	customerInfo: {
		mobileNumber: string;
	};
	transaction: {
		amount: number;
		orderId: string;
		transactionText: string;
		useExplicitCheckoutFlow: boolean;
	};
}

export interface VippsErrorResponse {
	errorCode: string;
	errorGroup: string;
	contextId?: string;
	errorMessage: string;
}

export interface VippsExpressOrderResponse {
	orderId: string;
	url: string;
	error?: VippsErrorResponse[];
}

export interface VippsExpressOrderDetailsResponse {
	orderId: string;
	transactionLogHistory: {
		amount: number;
		operation: string;
		operationSuccess: boolean;
		timeStamp: string;
		transactionText: string;
	}[];
	error: VippsErrorResponse[];
}

export interface VippsExpressCaptureOrderResponse {
	paymentInstrument: string;
	orderId: string;
	transactionInfo: {
		amount: number;
		status: string;
		timeStamp: string;
		transactionId: string;
		transactionText: string;
	};
	transactionSummary: {
		capturedAmount: number;
		refundedAmount: number;
		remainingAmountToCapture: number;
		remainingAmountToRefund: number;
		bankIdentificationNumber: number;
	};
	error?: VippsErrorResponse[];
}

export interface VippsEcommerceCaptureOrderProps {
	orderId: string;
	transactionText: string;
}
