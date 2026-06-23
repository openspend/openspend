import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { db } from '../postbase';
import { getAuth } from '../auth';

function useQuery() {
    const location = useLocation();
    return new URLSearchParams(location.url.split('?')[1]);
}

export function Search() {
    const query = useQuery();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [invoices, setInvoices] = useState([]);

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

        const q = query.get('q');

        (async () => {
            // TODO: Add OR filer by customer === users.ref
            let query = db.collection('invoices')
                .where('brand', '==', db.collection('brands').doc(user.id));

            if (q) {
                query = query.where('uniqueIdentifier', 'LIKE', q);
            }

            const snapshot = await query
                .orderBy('timestamp', 'desc')
                .get();

            if (snapshot.size > 0) {
                setInvoices(snapshot.map(doc => {
                    return {
                        id: doc.id,
                        ...doc.data(),
                    };
                }));
            }
        })();
    }, [user, query.get('q')]);

    if (loading) {
        return <div class="loading">Loading...</div>;
    }

    return (
        <div class="w-full flex flex-col items-center">
            <p class="mt-4 mb-10 text-4xl text-center">Search</p>

            <form method="get" action="/search">
                <div class="flex gap-2">
                    <input name="q"
                        placeholder="Search by invoice identifier (T5H3R5)"
                        class="min-w-40 md:min-w-100 border-1 p-4" />

                    <button
                        type="submit"
                        class="px-4 py-2 bg-blue-600 text-3xl text-white rounded hover:bg-blue-700 transition">
                        Search
                    </button>
                </div>
            </form>

            {invoices && <div>
                <div class="mt-10 mb-4 text-center grid grid-cols-4 border-b-1">
                    <div>
                        <p>Id</p>
                    </div>
                    <div>
                        <p>Amount</p>
                    </div>
                    <div>
                        <p>Status</p>
                    </div>
                    <div>
                        <p>Date Time</p>
                    </div>
                </div>
                {invoices.map(i => <a
                    href={`/invoice/${i.id}`}
                    class="mt-2 text-center grid grid-cols-4 cursor-pointer">
                    <div>
                        <p class="font-bold">{i?.uniqueIdentifier}</p>
                    </div>
                    <div>
                        <p>${i?.amount} + tax</p>
                    </div>
                    <div>
                        <p>{i?.status === 'paid' ? 'Paid' : 'Draft'}</p>
                    </div>
                    <div>
                        <p>{i?.timestamp && i?.timestamp.toDate().toString()}</p>
                    </div>
                </a>)}
            </div>}
        </div>
    );
}
