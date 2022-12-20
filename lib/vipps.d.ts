import { VippsExpressOrderProps, VippsConstructorOptions, VippsEcommerceConstructorOptions, VippsExpressOrderResponse, VippsExpressOrderDetailsResponse, VippsEcommerceCaptureOrderProps } from './types/vipps';
export declare class Vipps {
    private VIPPS_API_URL;
    private VIPPS_CLIENT_ID;
    private VIPPS_CLIENT_SECRET;
    private VIPPS_SUBSCRIPTION_KEY;
    private accessToken;
    private accessTokenExpiresAt;
    private merchantSerialNumber;
    constructor();
    config({ clientId, clientSecret, subscriptionKey, merchantSerialNumber }: VippsConstructorOptions): void;
    authenticate(props?: VippsConstructorOptions): Promise<{
        accessToken: string | undefined;
        accessTokenExpiresAt: number | undefined;
    }>;
    setMsn(merchantSerialNumber: string): void;
    setToken({ accessToken, accessTokenExpiresAt }: {
        accessToken?: string;
        accessTokenExpiresAt?: number;
    }): void;
    removeToken(): void;
    get authenticated(): boolean;
    get msn(): string | undefined;
    get api(): import("axios").AxiosInstance;
    get token(): {
        accessToken: string | undefined;
        accessTokenExpiresAt: number | undefined;
    };
}
export declare class VippsEcommerce extends Vipps {
    private callbackPrefix;
    private consentRemovalPrefix;
    private fallBack;
    private static instance;
    constructor(merchantSerialNumber?: string);
    static getInstance: (MSN?: string) => Promise<VippsEcommerce>;
    setOptions({ ...options }: VippsEcommerceConstructorOptions): void;
    expressOrder(order: VippsExpressOrderProps): Promise<VippsExpressOrderResponse>;
    getOrderDetails(orderId: string): Promise<VippsExpressOrderDetailsResponse>;
    captureOrder(captureOrderProps: VippsEcommerceCaptureOrderProps): Promise<any>;
}
