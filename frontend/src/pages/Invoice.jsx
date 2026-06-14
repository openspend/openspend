import { useRef, useState, useEffect } from 'preact/hooks';
import { useLocation, useRoute } from "preact-iso";
import QRCode from 'easyqrcodejs';
import { db } from '../postbase';
import { Timestamp } from '../../lib/postbase/db';
import { MdCopyAll } from 'react-icons/md';

const TAXES = [
    {
        name: 'TVQ',
        value: '9.975%',
        percent: 9.975 / 100,
    },
    {
        name: 'TPS',
        value: '5%',
        percent: 5 / 100,
    }
];

const TVQ = TAXES[0].percent;
const TPS = TAXES[1].percent;

export const INVOICE_STATUS = {
    DRAFT: 'draft',
    PAID: 'paid',
};

function generateSixDigitAlphanumeric() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charsLength = chars.length;

    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }

    return result;
}


export function Invoice() {
    const { params } = useRoute();
    const location = useLocation();
    const [amount, setAmount] = useState(15);
    const qrCodeRef = useRef(null);
    const qrInstance = useRef(null);
    const [showQrCode, setShowQrCode] = useState(false);
    const [invoice, setInvoice] = useState({
        email: '',
        currency: 'CAD',
        currencySymbol: '$',
        amount: 15,
        tax: 2.25,
        uniqueIdentifier: '',
        timestamp: new Date(),
        status: INVOICE_STATUS.DRAFT,
    });

    useEffect(() => {
        if (!params?.invoiceId) {
            setInvoice({
                email: '',
                currency: 'CAD',
                currencySymbol: '$',
                amount: 15,
                tax: 2.25,
                uniqueIdentifier: '',
                timestamp: new Date(),
                status: INVOICE_STATUS.DRAFT,
            });
            setAmount(15);

            if (qrInstance?.current) {
                qrInstance.current.clear();
            }

            setShowQrCode(false);

            return;
        }

        (async () => {
            const doc = await db.collection('invoices')
                .doc(params.invoiceId)
                .get();
            const invoice = {
                id: doc.id,
                ...doc.data(),
            };
            setInvoice(invoice);
            setAmount(invoice.amount);
            generateQrCode(invoice.id);
        })();

    }, [params?.invoiceId]);

    const createDraftInvoice = async (event) => {
        event.preventDefault();

        const uniqueIdentifier = generateSixDigitAlphanumeric();

        let amountDecimal = amount;
        if (typeof amountDecimal === 'string') {
            amountDecimal = parseFloat(amount);
        }
        const formData = {
            email: `DASVILLEDA+${uniqueIdentifier}@GMAIL.COM`,
            currency: 'CAD',
            currencySymbol: '$',
            amount: amountDecimal,
            tax: parseFloat(((amountDecimal * TVQ) + (amountDecimal * TPS)).toFixed(2)),
            uniqueIdentifier,
            timestamp: Timestamp.now(),
            status: INVOICE_STATUS.DRAFT,
        };

        const invoiceDoc = await db.collection('invoices').add(formData);
        const invoiceId = invoiceDoc.id;
        location.route(`/invoice/${invoiceId}`);
    };

    const generateQrCode = (invoiceId) => {
        if (qrInstance?.current) {
            qrInstance.current.clear();
        }

        setShowQrCode(true);

        setTimeout(() => {
            // Initialize EasyQRCodeJS
            const options = {
                text: import.meta.env.VITE_FRONTEND_URL + `/pay/${invoiceId}`,
            };

            qrInstance.current = new QRCode(qrCodeRef.current, options);
        }, 500);
    };

    const copyToClipboard = async (event, textToCopy) => {
        try {
            const target = event.currentTarget || event.target;
            await navigator.clipboard.writeText(textToCopy);
            target.innerText = '✅';
            setTimeout(
                () => target.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"></path></svg>',
                2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    const markAsPaid = async (event) => {
        if (confirm("Are you sure?")) {
            await db.collection('invoices').doc(invoice.id).set({
                status: INVOICE_STATUS.PAID,
                updatedOn: Timestamp.now(),
            }, { merge: true });
            location.route(`/invoice/${invoice.id}`);
        }
    };

    return (
        <div class="w-full flex flex-col items-center">
            <p class="mt-4 mb-10 text-4xl text-center">New Invoice</p>

            <form onSubmit={createDraftInvoice}>
                <div class="flex gap-2 px-2">
                    <span class="text-6xl">$</span><input name="amount"
                        type="number" min="0.01" step="0.01" inputmode="decimal"
                        placeholder="Amount (15)" value={amount}
                        class="border-1 text-xl p-4 max-w-40"
                        onChange={e => setAmount(e.target.value)} />

                    <button
                        type="submit"
                        class="px-4 py-2 bg-blue-600 text-2xl text-white rounded hover:bg-blue-700 transition">
                        Create
                    </button>
                </div>
                <div class="mt-10 flex flex-col gap-3 px-2 text-3xl">
                    <p key={`tvq-${amount}`} class="text-center">TVQ: ${(amount * TVQ).toFixed(2)}</p>
                    <p key={`tps-${amount}`} class="text-center">TPS: ${(amount * TPS).toFixed(2)}</p>
                    <p key={`total-${amount}`} class="text-center">Total: ${amount && (parseFloat(amount) + (amount * TVQ) + (amount * TPS)).toFixed(2)}</p>
                </div>
            </form>

            {invoice?.status === INVOICE_STATUS.PAID
                ? <div class="mt-8">
                    <p class="text-xl">Status: <span class="text-green-600">Paid</span></p>
                </div>
                : <div class="text-center">
                    <div class="mt-8">
                        <p class="text-xl">Status: <span class="text-red-600">Draft (Unpaid)</span></p>
                    </div>

                    <div class="mt-6 text-xl">
                        <div class="grid grid-cols-2 gap-2 relative">
                            <p class="text-right">Security Question:</p>
                            <p class="text-center font-semibold">Code</p>
                            <button class="absolute top-0 bottom-0 right-0 hover:bg-gray-300 rounded"
                                title="Copy Question"
                                onClick={e => copyToClipboard(e, "Code")}>
                                <MdCopyAll size={24} />
                            </button>
                        </div>
                        <div class="grid grid-cols-2 gap-2 relative">
                            <p class="text-right">Security Answer:</p>
                            <p class="text-center font-semibold">{invoice?.uniqueIdentifier}</p>
                            <button class="absolute top-0 bottom-0 right-0 hover:bg-gray-300 rounded"
                                title="Copy Answer"
                                onClick={e => copyToClipboard(e, invoice?.uniqueIdentifier)}>
                                <MdCopyAll size={24} />
                            </button>
                        </div>
                    </div>

                    <div class="mt-8">
                        {showQrCode && <button class="w-full flex items-center justify-center"
                            onClick={e => setShowQrCode(false)}>
                            <div>
                                <div ref={qrCodeRef}></div>
                            </div>
                        </button>}
                    </div>

                    <div class="mt-8">
                        <button
                            onClick={markAsPaid}
                            disabled={typeof invoice?.id === 'undefined'}
                            class={
                                typeof invoice?.id === 'undefined'
                                    ? "px-4 py-2 bg-gray-100 text-3xl text-gray-300 rounded transition"
                                    : "px-4 py-2 bg-blue-600 text-3xl text-white rounded hover:bg-blue-700 transition"
                            }>

                            Mark as Paid
                        </button>
                    </div>
                </div>}

        </div>
    );
}
