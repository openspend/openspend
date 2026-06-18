import express from 'express';
import nodemailer from 'nodemailer';

import { authClient } from '../admin/auth.js';
import { pool } from '../lib/postbase/db.js';
import { createAdminClient } from '../lib/postbase/compat/admin.js';

const admin = createAdminClient({ authClient, pool });

const db = admin.firestore();

const transporter = nodemailer.createTransport({
	service: 'SMTP',
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT || 465,
	auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD
	}
});

async function sendEmail(req, res) {
	try {
		const { invoiceId, email } = req.body;

		const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
		const invoice = invoiceDoc.data();

		const brandDoc = await invoice.brand.get();
		const brand = brandDoc.data();

		const offset = -4; // timezone offset
		const mDate = invoice?.timestamp.toDate();
		const offsetDate = new Date(mDate.toISOString());
		offsetDate.setUTCHours(mDate.getHours() + offset);
		const options = {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZoneName: 'short'
		};
		const formattedDate = offsetDate.toLocaleString('en-US', options);

		const taxesHtml_ = [];

		if (brand?.taxes && brand?.taxes.length > 0) {
			brand?.taxes.forEach(t => taxesHtml_.push(`<tr class="item">
							<td>${t.name} (${t.value})</td>

							<td>${invoice?.currencySymbol}${(invoice?.amount * t.percent).toFixed(2)} ${invoice?.currency}</td>
						</tr>`));
		}

		const taxesHtml = taxesHtml_.join('\n\n');

		const subject = `Invoice from ${brand.name || 'OpenSpend'}`;

		const html = `<!DOCTYPE html>
				<html>
					<head>
						<meta charset="utf-8" />
						<title>Invoice from ${brand.name || 'OpenSpend'}</title>

						<style>
							.invoice-box {
								max-width: 800px;
								margin: auto;
								padding: 30px;
								border: 1px solid #eee;
								box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
								font-size: 16px;
								line-height: 24px;
								font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
								color: #555;
							}

							.invoice-box table {
								width: 100%;
								line-height: inherit;
								text-align: left;
							}

							.invoice-box table td {
								padding: 5px;
								vertical-align: top;
							}

							.invoice-box table tr td:nth-child(2) {
								text-align: right;
							}

							.invoice-box table tr.top table td {
								padding-bottom: 20px;
							}

							.invoice-box table tr.top table td.title {
								font-size: 45px;
								line-height: 45px;
								color: #333;
							}

							.invoice-box table tr.information table td {
								padding-bottom: 40px;
							}

							.invoice-box table tr.heading td {
								background: #eee;
								border-bottom: 1px solid #ddd;
								font-weight: bold;
							}

							.invoice-box table tr.details td {
								padding-bottom: 20px;
							}

							.invoice-box table tr.item td {
								border-bottom: 1px solid #eee;
							}

							.invoice-box table tr.item.last td {
								border-bottom: none;
							}

							.invoice-box table tr.total td:nth-child(2) {
								border-top: 2px solid #eee;
								font-weight: bold;
							}

							@media only screen and (max-width: 600px) {
								.invoice-box table tr.top table td {
									width: 100%;
									display: block;
									text-align: center;
								}

								.invoice-box table tr.information table td {
									width: 100%;
									display: block;
									text-align: center;
								}
							}

							/** RTL **/
							.invoice-box.rtl {
								direction: rtl;
								font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
							}

							.invoice-box.rtl table {
								text-align: right;
							}

							.invoice-box.rtl table tr td:nth-child(2) {
								text-align: left;
							}
						</style>
					</head>

					<body>
						<div class="invoice-box">
							<table cellpadding="0" cellspacing="0">
								<tr class="top">
									<td colspan="2">
										<table>
											<tr>
												<td>
													Invoice #: ${invoice?.uniqueIdentifier}<br />
													Created: ${formattedDate}<br />
													Due: ${formattedDate}<br />
													Status: ${invoice?.status === 'paid' ? 'Paid' : 'Unpaid'}
												</td>
											</tr>
										</table>
									</td>
								</tr>

								<tr class="information">
									<td colspan="2">
										<table>
											<tr>
												<td>
													${brand?.name}<br />
													${brand?.address?.street}<br />
													${brand?.address?.unit}<br />
													${brand?.address?.city}, ${brand?.address?.state} ${brand?.address?.zipcode}<br />
													${brand?.address?.country}
												</td>
											</tr>
										</table>
									</td>
								</tr>

								<tr class="heading">
									<td>Payment Method</td>

									<td>Online Transfer</td>
								</tr>

								<tr class="heading">
									<td>Item</td>

									<td>Price</td>
								</tr>

								<tr class="item">
									<td>Product</td>

									<td>${invoice?.currencySymbol}${invoice?.amount} ${invoice?.currency}</td>
								</tr>

								${taxesHtml}

								<tr class="total">
									<td></td>

									<td>Total: ${invoice?.currencySymbol}${invoice?.amount + invoice?.tax} ${invoice?.currency}</td>
								</tr>
							</table>
						</div>
					</body>
				</html>`;

		const emailOpts = {
			from: process.env.SMTP_FROM_EMAIL,
			to: email,
			subject,
			html,
		};

		await transporter.sendMail(emailOpts);

		res.status(200).json({ status: 'ok' });

	} catch (err) {
		console.error(err);
		res.status(500).json({ status: 'error', error: 'Internal Error' });
	}
}

async function requestDemoEmail(req, res) {
	const formData = req.body;
	const name = formData?.name;
	const company = formData?.companyName;
	const subject = `[${formData?.urgency}] New Demo Request from ${name} at ${company}`;
	const html = `<table>
                <tr>
                    <td>
                        <b>Name</b>
                    </td>
                    <td>
                        ${formData?.name}
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Email</b>
                    </td>
                    <td>
                        ${formData?.email}
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Phone</b>
                    </td>
                    <td>
                        ${formData?.phone}
                    </td>
                </tr>
                <tr>
                    <td>
                        <b>Company</b>
                    </td>
                    <td>
                        ${formData?.company}
                    </td>
                </tr>
				<tr>
                    <td>
                        <b>Urgency</b>
                    </td>
                    <td>
                        ${formData?.urgency}
                    </td>
                </tr>
            </table>`;

	const emailOpts = {
		from: process.env.SMTP_FROM_EMAIL,
		to: 'umair@openspend.riamu.io',
		subject,
		html,
	};

	await transporter.sendMail(emailOpts);

	res.status(200).json({ status: 'ok' });
}

export const emailRouter = express.Router();
emailRouter.post('/new', sendEmail);
emailRouter.post('/demo', requestDemoEmail);
