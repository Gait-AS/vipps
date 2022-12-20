import { AuthenticateOptions, VippsExpressOrderProps, VippsConstructorOptions, VippsEcommerceConstructorOptions, VippsExpressOrderResponse, VippsExpressOrderDetailsResponse, VippsEcommerceCaptureOrderProps } from './types/vipps';
export declare class Vipps {
    private readonly SUBSCRIPTION_KEY;
    private accessToken;
    private merchantSerialNumber;
    constructor({ subscriptionKey, authToken }: VippsConstructorOptions);
    authenticate({ clientId, clientSecret, subscriptionKey }: AuthenticateOptions): Promise<any>;
    setMsn(merchantSerialNumber: string): void;
    get msn(): string | undefined;
    get api(): import("axios").AxiosInstance;
    get token(): string | undefined;
}
export declare class VippsEcommerce extends Vipps {
    private callbackPrefix;
    private consentRemovalPrefix;
    private fallBack;
    private static instance;
    constructor(options: VippsConstructorOptions, merchantSerialNumber?: string);
    static getInstance: (MSN?: string) => Promise<VippsEcommerce>;
    setOptions({ ...options }: VippsEcommerceConstructorOptions): void;
    expressOrder(order: VippsExpressOrderProps): Promise<VippsExpressOrderResponse>;
    getOrderDetails(orderId: string): Promise<VippsExpressOrderDetailsResponse>;
    captureOrder(captureOrderProps: VippsEcommerceCaptureOrderProps): Promise<any>;
}
