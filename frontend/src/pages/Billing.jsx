import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { db } from "../postbase";
import { generateSixDigitAlphanumeric } from "../common/generateSixDigitAlphanumeric";
import { Timestamp } from "../../lib/postbase/db";
import { INVOICE_STATUS } from "./Invoice";
import { getAuth } from "../auth";

const series = [10, 20, 50, 100];

const BRAND_BY_CURRENCY = {
    'USD': import.meta.env.VITE_BRAND_ID_USD,
    'CAD': import.meta.env.VITE_BRAND_ID_CAD,
};

export default function Billing() {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userObj, setUserObj] = useState(null);
    const [userBrand, setUserBrand] = useState(null);
    const [brand, setBrand] = useState(null);
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        setLoading(false);

        const auth = getAuth();

        if (!user) {
            setUser(auth.currentUser);
        }

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setLoading(false);
            if (user) {
                setUser(user);
            } else {
                const redirectUrl = window.location.href.replace(window.location.origin, '');
                location.route('/login?redirectUrl=' + redirectUrl);
            }
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
            const userBrandDoc = await db.collection('brands').doc(user.id).get();
            const userBrand = userBrandDoc.data();
            setUserBrand(userBrand);

            let brandId = BRAND_BY_CURRENCY['USD'];
            if (BRAND_BY_CURRENCY.hasOwnProperty(userBrand.currency)) {
                brandId = BRAND_BY_CURRENCY[userBrand.currency];
            }

            // Get OpenSpend brand
            const brandDoc = await db.collection('brands').doc(brandId).get();
            const brand = brandDoc.data();
            setBrand(brand);
        })();
    }, [user]);

    const createInvoice = async (amount) => {
        if (!userBrand) {
            alert('Please set brand name, email and currency in settings');
            return;
        }

        if (!userBrand.hasOwnProperty('currency') || !userBrand.currency) {
            alert('Please set currency in settings');
            return;
        }

        const uniqueIdentifier = generateSixDigitAlphanumeric();

        let email = brand?.depositEmail || 'interacumair@gmail.com';
        if (email && (!(brand || {}).hasOwnProperty('uniqueIdentifier') || brand?.uniqueIdentifier)) {
            let [emailUser, emailDomain] = email.split('@');
            email = `${emailUser.toUpperCase()}+${uniqueIdentifier}@${emailDomain.toUpperCase()}`;
        }

        let tax = 0;
        const taxes = (brand?.taxes || []).map(t => t.percent);
        if (taxes && taxes.length > 0) {
            tax = taxes.reduce((p, c) => p + c, 0);
        }

        // create invoice and redirect to pay page
        const formData = {
            brand,
            name: brand?.name || 'OpenSpend',
            email,
            currency: brand?.currency || 'USD',
            currencySymbol: brand?.currencySymbol || '$',
            amount,
            tax: amount * tax,
            uniqueIdentifier,
            timestamp: Timestamp.now(),
            status: INVOICE_STATUS.DRAFT,
        };

        const invoiceDoc = await db.collection('invoices').add(formData);
        const invoiceId = invoiceDoc.id;
        location.route(`/pay/${invoiceId}`);
    };

    if (loading) {
        return <div class="loading">Loading...</div>;
    }

    return <div class="w-full flex flex-col items-center text-center text-2xl gap-8 p-4">
        <h2 class="mt-4 text-4xl text-center">Billing</h2>

        <p>OpenSpend uses OpenSpend to manage billing.</p>

        <p>Your current balance is: <span>{brand?.currencySymbol || '$'}{(userObj?.balance || 0).toFixed(2)}</span></p>

        <p>How much would you like to add?</p>
        <div class="flex flex-wrap items-center justify-center gap-2">
            {series.map(s => <button class="border-1 px-4 py-3 cursor-pointer hover:bg-gray-400" onClick={e => createInvoice(s)}>${s}</button>)}
        </div>

        <input name="amount" type="number" min="110" step="10" class="border-1 w-80 px-2 py-3" placeholder="Custom Amount ($1500)" onChange={e => setAmount(e.target.value)} />
        <button class="bg-blue-600 text-white text-lg border-1 px-8 py-3 rounded" onClick={e => createInvoice(amount)}>Create Invoice</button>

        <p>All prices are in {brand?.currency || 'USD'}</p>
    </div>;
}
