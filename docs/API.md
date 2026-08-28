# API Docs

## Create a new invoice

```javascript
const resp = await fetch('https://app.openspend.riamu.io/api/v1/invoice/new', {
    method: 'post',
    headers: {
        'content-type': 'application/json',
        'x-api-key': 'API-KEY',
    },
    body: JSON.stringify({
        amount: 1500,
        callbackUrl: 'https://www.your_website.com/payment_status?key=uniqueValue',
    }),
});

const data = await resp.json();

if (resp.ok && data.status === 'ok') {
    
    // data.invoice.id

    // Redirect your users to pay https://app.openspend.riamu.io/pay/${data.invoice.id}

    // After payment success or failure

    // User will be redirected to https://www.your_website.com/payment_status?key=uniqueValue&status=paid&updatedAt=timestamp

    // OR

    // https://www.your_website.com/payment_status?key=uniqueValue&status=draft&updatedAt=timestamp
} else {
    // data.status === 'error'
    // data.error will explain the error
}
```