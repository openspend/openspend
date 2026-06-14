import { useRef, useState, useEffect } from 'preact/hooks';
import { useLocation, useRoute } from "preact-iso";
import QRCode from 'easyqrcodejs';
import { db } from '../postbase';
import { Timestamp } from '../../lib/postbase/db';

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
        amount: 0.01,
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
                amount: 0.01,
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

        const formData = {
            email: `DASVILLEDA+${uniqueIdentifier}@GMAIL.COM`,
            currency: 'CAD',
            currencySymbol: '$',
            amount,
            uniqueIdentifier,
            timestamp: Timestamp.now(),
            status: INVOICE_STATUS.DRAFT,
        }

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
            </form>

            {invoice?.status === INVOICE_STATUS.PAID
                ? <div class="mt-8">
                    <p class="text-xl">Status: <span class="text-green-600">Paid</span></p>
                </div>
                : <div class="text-center">
                    <div class="mt-8">
                        <p class="text-xl">Status: <span class="text-red-600">Draft (Unpaid)</span></p>
                    </div>

                    <div class="mt-8">
                        {showQrCode && <button class="flex bg-white items-center justify-center"
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
