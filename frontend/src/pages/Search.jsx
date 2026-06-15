import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { db } from '../postbase';

function useQuery() {
    const location = useLocation();
    return new URLSearchParams(location.url.split('?')[1]);
}

export function Search() {
    const query = useQuery();
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const q = query.get('q');

        if (!q) return;

        (async () => {
            const snapshot = await db.collection('invoices')
                .where('uniqueIdentifier', 'LIKE', q)
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
    }, [query.get('q')]);

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
                <div class="mt-10 mb-4 min-w-150 text-center grid grid-cols-4 border-b-1">
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
                {invoices.map(i => <div class="mt-2 min-w-150 text-center grid grid-cols-4">
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
                        <p>{i?.timestamp.toDate().toString()}</p>
                    </div>
                </div>)}
            </div>}
        </div>
    );
}
