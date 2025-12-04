![Open Spend Logo](https://github.com/openspend/openspend/blob/main/logo.png?raw=true)

# Open Spend 💸

How about a payment gateway without a middle man like PayPal, Stripe, 2Checkout, etc?

## What is OpenSpend?

OpenSpend is an open-source, free-to-use, self-hosted payment gateway for your next app, project, or business. It lets end users send money using their online banking directly to businesses using their online banking app or website. And businesses can check live and instantly whether the money has been deposited or not. 

By using OpenSpend, businesses are responsible for compliance; therefore, it also provides written Refund policy, Terms and Conditions and Privacy Policy templates. It is the responsibility of the business using OpenSpend to ensure compliance with its local and international laws.

The idea is that people use online banking to send money (pay) to businesses, and OpenSpend automates the process by going into the business email inbox and clicking the link and following the steps to deposit the money.

There are many banks around the world, and most countries have some sort of online money transfer by email or phone.

The trick is to use a different email address for every user/customer like business_name+customer_id@their_website.com here customer_id changes for every customer. But all the emails get to the same inbox and the script using selenium should automate the bank login and making the deposit. After a successful or fail deposit, a webhook is called.

To login to bank website, business owner setup OpenSpend to use an .env file with predefined username and password. It doesn't need to work for all the banks to begin with. Just one widely used bank. It will be tricky to use banks which enforce two-factor authentication (2FA).
