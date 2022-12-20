<img width='300' src="assets/vipps_logo_rgb.png" alt='vipps orange logo'>
<img width='100' src="assets/favicon2.png" alt='vipps orange logo'>

# Vipps node library
Non-official Vipps eCommerce NPM package to manage Vipps eCom API.

## Installation
```bash
npm install @gait-as/vipps
```

## Pre-requisites
- Node.js 8.0 or higher
- Vipps API-keys
- Vipps test account
- Vipps test app
- Vipps test merchant

### Environment variables
```bash
VIPPS_SYSTEM_NAME=your-system-name
VIPPS_API_URL=https://apitest.vipps.no or https://api.vipps.no for production
VIPPS_CLIENT_ID=vipps-client-id
VIPPS_CLIENT_SECRET=vipps-client-secret
VIPPS_SUBSCRIPTION_KEY=vipps-subscription-key
VIPPS_SUBSCRIPTION_KEY_SECONDARY=vipps-subscription-key-secondary
```

## Basic usage
### Initialize
```javascript
const Vipps = require('@gait-as/vipps');
const vipps = new Vipps({}) // This initializes the Vipps object with the environment variables

// OR Create a new instance with your own config
const vipps2 = new Vipps({
	clientId: 'your vipps client id',
	clientSecret: 'your vipps client secret',
	authToken: 'your vipps auth token',
	subscriptionKey: 'your vipps subscription key',
})

const token = await vipps.authenticate({}); // This will return a token for the Vipps API and set it in the Vipps object
const api = vipps.api; // This will return the Vipps API object

api.get('/url')...
```

### Set/get Merchant Serial Number
```javascript
...

vipps.setMsn('your-merchant-serial-number');
const msn = vipps.getMsn();
```

## eCom API

### Create express payment
This will create an express payment and return the ***payment URL*** and ***order Id***.
```javascript
/**
 * Data required for creating an order
 */
const orderData: VippsExpressOrderProps = {
    merchantInfo: {
        "paymentType": "eComm Express Payment",
        "shippingDetailsPrefix": "DT-",
        "staticShippingDetails": [
            {
                "isDefault": "Y",
                "priority": 1,
                "shippingCost": 90,
                "shippingMethod": "Bil",
                "shippingMethodId": "shippingMethodId1"
            },
            {
                "isDefault": "N",
                "priority": 2,
                "shippingCost": 200,
                "shippingMethod": "Sykkel",
                "shippingMethodId": "shippingMethodId2"
            }
        ]
    },
    customerInfo: {
        mobileNumber: '44444444',
    },
    transaction: {
        amount: 100,
        orderId: Date.now().toString(),
        transactionText: 'Test',
        useExplicitCheckoutFlow: true,
    }
}

const testOrder = async () => {
    /**
     * Initialize Vipps instance and automatically authenticate
     * This will use the credentials from the environment variables,
     * or the ones provided in the constructor
     */
    const vipps = await VippsEcommerce.getInstance()
    
    
    /**
     * Set vipps options required for the order
     * This will NOT default to environment variables
     */
    vipps.setOptions({
        callbackPrefix: 'https://gait-as-packages.herokuapp.com/api/vipps',
        consentRemovalPrefix: 'https://gait-as-packages.herokuapp.com/api/vipps',
        fallback: 'https://gait.no',
        merchantSerialNumber: '229350',
    })
    
    
    /**
     * Create the order and get the response
     * This will return a promise
     * The response will contain the url to redirect the user to, and the order id
     */
    const order: VippsExpressOrderResponse = await vipps.expressOrder(orderData)
        .then((response ) => {
            return response;
        })
        .catch((error) => {
            return error;
        })
    
    console.log(order);
}
```

### Capture payment
Used for capturing a payment after the user has been redirected back to the merchant.
```javascript
const testCapture = async (orderToCapture: VippsEcommerceCaptureOrderProps) => {
    const vipps = await VippsEcommerce.getInstance('229350')

    const capture = await vipps.captureOrder(orderToCapture)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.log(error);
        })

    console.log(capture)
}

testCapture({
	orderId: '1671541910915',
	transactionText: 'Test',
})
```

### Get order status
Used for getting the status of an order.
```javascript
/**
 * Get the order details from the order id
 * This will return a promise
 * The response will contain the order details
 * This is useful for checking the status of the order
 */
const testOrderStatus = async (orderId: string) => {
	const vipps = await VippsEcommerce.getInstance()

	const orderDetails = await vipps.getOrderDetails(orderId)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log(error);
		})

	console.log(orderDetails)
}

testOrderStatus('1671541910915')
```

