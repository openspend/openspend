import { useEffect, useRef, useState } from 'preact/hooks';
import { useRoute } from "preact-iso";
import { MdCopyAll } from 'react-icons/md';
import { db } from '../postbase';
import { INVOICE_STATUS } from './Invoice';
import { documentId } from '../../lib/postbase/db';
import { getAuth } from '../auth';

export function Pay() {
    const { params } = useRoute();
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [invoice, setInvoice] = useState({
        name: '',
        email: '',
        currency: 'CAD',
        currencySymbol: '$',
        amount: 15,
        tax: 0,
        uniqueIdentifier: '',
        timestamp: new Date(),
        status: INVOICE_STATUS.DRAFT,
    });
    const [email, setEmail] = useState('');
    const buttonRef = useRef(null);

    useEffect(() => {
        const auth = getAuth();

        if (!user) {
            setUser(auth.currentUser);
        }

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!params?.invoiceId) return;

        const unsub = db.collection('invoices')
            .where(documentId(), '==', params.invoiceId)
            .onSnapshot(snapshot => {
                if (snapshot.size > 0) {
                    const doc = snapshot.docs[0];
                    const invoice = {
                        id: doc.id,
                        ...doc.data(),
                    };
                    setInvoice(invoice);
                }
            });

        return () => unsub();

    }, [params?.invoiceId]);

    useEffect(() => {
        document.addEventListener("keyup", function (event) {
            if (event.key === "Escape") {
                cancel();
            }
        });

        return () => document.removeEventListener("keyup", function (event) {
            if (event.key === "Escape") {
                cancel();
            }
        });
    }, []);

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

    const cancel = async () => {
        setOpen(false);
        const invoiceDoc = await db.collection('invoices').doc(params?.invoiceId).get();
        setInvoice({
            id: invoiceDoc.id,
            ...invoiceDoc.data(),
        });
    };

    const sendInvoiceByEmail = async (event) => {
        event.preventDefault();

        if (!email) return;

        if (buttonRef?.current) buttonRef.current.innerText = '✅ Sent';

        await fetch(import.meta.env.VITE_API_BASE + '/email/new', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoiceId: invoice.id, email }),
        });

        setTimeout(() => {
            if (buttonRef?.current) buttonRef.current.innerText = 'Send';
        }, 2000);
    };

    const saveInvoice = async (event) => {
        if (!user) {
            alert('Please create an account or login');
            return;
        }

        buttonRef.current = event.currentTarget || event.target;
        buttonRef.current.innerText = '✅ Saved';

        await db.collection('invoices').doc(params?.invoiceId).set(
            { customer: db.collection('users').doc(user.id) },
            { merge: true });

        setTimeout(() => {
            if (buttonRef?.current) buttonRef.current.innerText = 'Save';
        }, 2000);
    };

    if (invoice?.status === INVOICE_STATUS.PAID) {
        return <div class="w-full flex flex-col items-center">
            <div class="mt-8 mb-16 flex flex-col items-center gap-1">
                <p class="text-sm font-semibold">Code</p>
                <p class="text-6xl">{invoice?.uniqueIdentifier}</p>
            </div>

            <div class="mb-8">
                <p class="text-4xl">Status: <span class="text-green-600">Paid</span></p>
            </div>

            <div class="mb-10 text-center">
                <form onSubmit={sendInvoiceByEmail}>
                    <p class="mb-4 text-4xl">Need a receipt?</p>
                    <div class="flex gap-2">
                        <input name="email"
                            type="email"
                            placeholder="Type your email address" value={email}
                            class="border-1 p-4 md:min-w-120"
                            onChange={e => setEmail(e.target.value)} />

                        <button
                            type="submit"
                            class="px-4 py-2 bg-blue-600 text-3xl text-white rounded hover:bg-blue-700 transition"
                            onClick={e => buttonRef.current = e.target}>
                            Send
                        </button>
                    </div>
                </form>
                <p class="my-10 text-4xl">Or</p>
                <div>
                    <p class="text-4xl">Save to your account</p>
                    <button
                        type="submit"
                        class="my-8 px-4 py-2 bg-blue-600 text-3xl text-white rounded hover:bg-blue-700 transition"
                        onClick={saveInvoice}>
                        Save
                    </button>
                </div>
            </div>
        </div>;
    }

    return (
        <div class="w-full flex flex-col items-center p-2 gap-8">
            <p class="text-4xl text-center">Send money by email</p>
            <p class="text-xl">E.g, Zelle or Interac</p>
            <button
                class="px-10 py-2 bg-blue-600 text-3xl text-white rounded hover:bg-blue-700 transition"
                onClick={() => setOpen(true)}
            >
                Start
            </button>

            <p class="">It's fast and free. No sign in required.</p>

            {/* Backdrop */}
            <div
                class={`
          fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
                onClick={() => setOpen(true)}
            />

            {/* Slide-up Dialog */}
            <div
                class={`
          fixed left-0 right-0 mx-auto max-w-md bg-white rounded-t-xl shadow-xl
          transition-transform duration-300
          ${open ? "translate-y-0 bottom-0" : "translate-y-full bottom-0"}
        `}
            >
                <div class="relative p-6 text-center">
                    <button
                        class="fixed top-0 right-0 mt-5 mr-4 px-4 py-2 text-gray-400 bg-gray-100 hover:bg-gray-300 rounded transition"
                        onClick={() => cancel()}
                    >
                        X
                    </button>

                    <p class="text-gray-700 w-80 m-auto">
                        Open your bank app and send a transfer
                    </p>

                    <div class="mt-4 relative flex items-center justify-center">
                        <h2 class="text-3xl font-semibold">{invoice?.currencySymbol}{invoice?.amount + invoice?.tax} {invoice?.currency}</h2>
                        <button class="absolute top-0 bottom-0 right-0 hover:bg-gray-300 rounded"
                            title="Copy Amount"
                            onClick={e => copyToClipboard(e, invoice?.amount + invoice?.tax)}>
                            <MdCopyAll size={24} />
                        </button>
                    </div>

                    <div>
                        <h3 class="mt-6 font-bold text-gray-500">Name</h3>
                        <div class="relative flex items-center justify gap-2">
                            <p class="text-lg text-gray-700 font-bold w-full">{invoice?.name}</p>
                            <button class="absolute right-0 hover:bg-gray-300 rounded"
                                title="Copy Email"
                                onClick={e => copyToClipboard(e, invoice?.name)}>
                                <MdCopyAll size={24} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 class="mt-6 font-bold text-gray-500">Transfer to Email</h3>
                        <div class="relative flex items-center justify gap-2">
                            <p class="text-lg text-gray-700 font-bold w-full">{invoice?.email}</p>
                            <button class="absolute right-0 hover:bg-gray-300 rounded"
                                title="Copy Email"
                                onClick={e => copyToClipboard(e, invoice?.email)}>
                                <MdCopyAll size={24} />
                            </button>
                        </div>
                    </div>

                    {invoice?.currency === 'USD'
                        ? <div>
                            <div>
                                <h3 class="mt-6 font-bold text-gray-500">Memo (Mandatory):</h3>
                                <div class="relative flex items-center justify gap-2">
                                    <p class="text-lg text-gray-700 font-bold w-full">Code: {invoice?.uniqueIdentifier}</p>
                                    <button class="absolute right-0 hover:bg-gray-300 rounded"
                                        title="Copy Answer"
                                        onClick={e => copyToClipboard(e, 'Code: ' + invoice?.uniqueIdentifier)}>
                                        <MdCopyAll size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        : <div>
                            <div>
                                <h3 class="mt-6 font-bold text-gray-500">Security Question (Optional):</h3>
                                <div class="relative flex items-center justify gap-2">
                                    <p class="text-lg text-gray-700 font-bold w-full">Code</p>
                                    <button class="absolute right-0 hover:bg-gray-300 rounded"
                                        title="Copy Question"
                                        onClick={e => copyToClipboard(e, "Code")}>
                                        <MdCopyAll size={24} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 class="mt-6 font-bold text-gray-500">Security Answer (Optional):</h3>
                                <div class="relative flex items-center justify gap-2">
                                    <p class="text-lg text-gray-700 font-bold w-full">{invoice?.uniqueIdentifier}</p>
                                    <button class="absolute right-0 hover:bg-gray-300 rounded"
                                        title="Copy Answer"
                                        onClick={e => copyToClipboard(e, invoice?.uniqueIdentifier)}>
                                        <MdCopyAll size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>}

                    <div class="flex justify-center mt-6">
                        <div class="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        </div >
    );
}
