import { useRef, useState, useEffect } from 'preact/hooks';
import { useLocation, useRoute } from "preact-iso";
import QRCode from 'easyqrcodejs';
import { db } from '../postbase';
import { Timestamp } from '../../lib/postbase/db';
import { MdCopyAll } from 'react-icons/md';
import { getAuth } from '../auth';
import { generateSixDigitAlphanumeric } from '../common/generateSixDigitAlphanumeric';

export const INVOICE_STATUS = {
    DRAFT: 'draft',
    PAID: 'paid',
};

export function Invoice() {
    const { params } = useRoute();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userObj, setUserObj] = useState(null);
    const [brand, setBrand] = useState(
        // {
        //     name: 'CasaZero',
        //     depositEmail: 'dasvilleda@gmail.com',
        //     currency: 'CAD',
        //     currencySymbol: '$',
        //     uniqueIdentifier: true,
        //     taxes: [{
        //         name: 'TVQ',
        //         value: '9.975%',
        //         percent: 9.975 / 100,
        //     },
        //     {
        //         name: 'TPS',
        //         value: '5%',
        //         percent: 5 / 100,
        //     }],
        // }
    );
    const [amount, setAmount] = useState(15);
    const qrCodeRef = useRef(null);
    const qrInstance = useRef(null);
    const [showQrCode, setShowQrCode] = useState(false);
    const [invoice, setInvoice] = useState({
        name: '',
        email: '',
        currency: 'CAD',
        currencySymbol: '$',
        amount: 15,
        tax: 0.00,
        uniqueIdentifier: '',
        timestamp: new Date(),
        status: INVOICE_STATUS.DRAFT,
    });
    const [tax, setTax] = useState(0);

    useEffect(() => {
        setLoading(false);

        const auth = getAuth();

        if (!user) {
            setUser(auth.currentUser);
        }

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setLoading(false);
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        (async () => {
            const userDoc = await db.collection('users').doc(user.id).get();
            const userObj = {
                id: userDoc.id,
                ...userDoc.data(),
            };
            setUserObj(userObj);
        })();

        (async () => {
            const brandDoc = await db.collection('brands').doc(user.id).get();
            const brand = {
                id: brandDoc.id,
                ...brandDoc.data(),
            };
            setBrand(brand);

            const taxes = (brand?.taxes || []).map(t => t.percent);
            if (taxes && taxes.length > 0) {
                const tax = taxes.reduce((p, c) => p + c, 0);
                setTax(tax);
            } else {
                setTax(0);
            }
        })();

    }, [user]);

    useEffect(() => {
        if (!params?.invoiceId) {
            setInvoice({
                name: '',
                email: '',
                currency: 'CAD',
                currencySymbol: '$',
                amount: 15,
                tax,
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
            if (invoice.status === INVOICE_STATUS.DRAFT) {
                generateQrCode(invoice.id);
            }
        })();

    }, [params?.invoiceId]);

    const createDraftInvoice = async (event) => {
        event.preventDefault();

        if (!user) {
            alert('Please sign in first');
            return;
        }

        if (!userObj) {
            alert('Older account. Please close your account and start over with new sign up.');
            return;
        }

        let amountDecimal = amount;
        if (typeof amountDecimal === 'string') {
            amountDecimal = parseFloat(amount);
        }

        if (!userObj.hasOwnProperty('balance') || userObj.balance < (amount * 0.329)) {
            alert('Insufficient balance. Please add money to your account from billing\'s page');
            return;
        }

        const uniqueIdentifier = generateSixDigitAlphanumeric();

        let email = brand?.depositEmail;
        if (email && (!brand.hasOwnProperty('uniqueIdentifier') || brand?.uniqueIdentifier)) {
            let [emailUser, emailDomain] = email.split('@');
            email = `${emailUser.toUpperCase()}+${uniqueIdentifier}@${emailDomain.toUpperCase()}`;
        }

        const taxes = (brand?.taxes || []).map(t => t.percent);
        if (taxes && taxes.length > 0) {
            const tax = taxes.reduce((p, c) => p + c, 0);
            setTax(tax);
        } else {
            setTax(0);
        }

        const formData = {
            brand,
            name: brand?.name || 'CasaZero',
            email,
            currency: brand?.currency || 'CAD',
            currencySymbol: brand?.currencySymbol || '$',
            amount: amountDecimal,
            tax: parseFloat((amount * tax).toFixed(2)),
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
            let baseUrl = import.meta.env.VITE_FRONTEND_URL;

            if (baseUrl === 'https://openspend.riamu.io') {
                baseUrl = 'https://app.openspend.riamu.io';
            }

            const options = {
                text: baseUrl + `/pay/${invoiceId}`,
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

    if (loading) {
        return <div class="loading">Loading...</div>;
    }

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

                <div class="text-sm text-center">
                    <p>Currency: <span class="font-bold">{brand?.currency || 'USD'}</span></p>
                </div>

                {brand && brand?.taxes
                    ? <div class="mt-10 flex flex-col gap-3 px-2 text-3xl">
                        {brand?.taxes.map(t => <p key={`${t.name}-${amount}`} class="text-center">{t.name}: {brand.currencySymbol}{(amount * t.percent).toFixed(2)}</p>)}
                        <p key={`total-${amount}`} class="text-center">Total: {brand?.currencySymbol || '$'}{amount && (parseFloat(amount) + (amount * tax)).toFixed(2)}</p>
                    </div>
                    : <div class="mt-10 flex flex-col gap-3 px-2 text-3xl">
                        <p key={`total-${amount}`} class="text-center">Total: {brand?.currencySymbol || '$'}{amount && (parseFloat(amount) + (amount * tax)).toFixed(2)}</p>
                    </div>
                }
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
