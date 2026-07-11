import { useEffect, useRef, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { IoClose } from 'react-icons/io5';
import { getAuth } from '../auth';
import { db } from '../postbase';

export function Settings() {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [brand, setBrand] = useState(
        {
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
        }
    );
    const buttonRef = useRef(null);
    const [addressData, setAddressData] = useState({
        street1: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    });

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
            const brandDoc = await db.collection('brands').doc(user.id).get();
            setBrand({
                id: brandDoc.id,
                ...brandDoc.data(),
            });
        })();

    }, [user]);

    const handleChange = (event) => {
        const target = event.currentTarget || event.target;
        const { name, value } = target;
        setBrand({ ...brand, [name]: value });
    }

    const update = async (event) => {
        event?.preventDefault();

        if (buttonRef?.current) buttonRef.current.innerText = '✅ Updated';

        try {
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            let obj = data;
            if (data.hasOwnProperty('street')) {
                obj = { address: data };
            }

            if (!obj.hasOwnProperty('uniqueIdentifier')) {
                obj.uniqueIdentifier = false;
            } else if (obj.uniqueIdentifier === 'on') {
                obj.uniqueIdentifier = true;
            }

            await db.collection('brands').doc(user.id).set(obj, { merge: true });

            setBrand({ ...brand, ...obj });
        } catch (err) {

        } finally {
            setTimeout(() => {
                if (buttonRef?.current) buttonRef.current.innerText = 'Update';
            }, 2000);
        }
    };

    const addTax = async (event) => {
        event?.preventDefault();

        try {
            const formData = new FormData(event.target);
            const { name, value, percent } = Object.fromEntries(formData.entries());

            if (!name || !value || !percent) {
                buttonRef.current = null;
                return;
            }

            if (buttonRef?.current) buttonRef.current.innerText = '✅ Added';

            let taxes = [];
            if (brand && brand?.taxes) {
                taxes = brand.taxes;
            }

            taxes.push(
                {
                    name,
                    value,
                    percent: parseFloat(percent),
                },
            );

            await db.collection('brands').doc(user.id).set({ taxes }, { merge: true });

            const brandDoc = await db.collection('brands').doc(user.id).get();
            setBrand({
                id: brandDoc.id,
                ...brandDoc.data(),
            });
        } catch (err) {

        } finally {
            setTimeout(() => {
                if (buttonRef?.current) buttonRef.current.innerText = 'Add';
            }, 2000);
        }
    };

    const deleteTax = async (event, tax) => {
        event?.preventDefault();

        let taxes = [];
        if (brand && brand?.taxes) {
            taxes = brand.taxes;
        }

        const index = taxes.findIndex(t => t.name === tax.name)
        if (index !== -1) {
            taxes.splice(index, 1);
        }

        await db.collection('brands').doc(user.id).set({ taxes }, { merge: true });

        const brandDoc = await db.collection('brands').doc(user.id).get();
        setBrand({
            id: brandDoc.id,
            ...brandDoc.data(),
        });
    };

    if (loading) {
        return <div class="loading">Loading...</div>;
    }

    return (
        <div class="w-full flex flex-col items-center">
            <h2 class="mt-4 mb-10 text-4xl text-center">Settings</h2>

            <div class="w-full md:w-150 p-2">
                <div class="">
                    <h3 class="mt-8 mb-4 text-3xl text-center">Brand / Company Name</h3>
                    <p class="text-sm py-2">This is the contact name customers will use to save your email in their online banking app.</p>
                    <form class="w-full grid grid-cols-3 gap-2" onSubmit={update}>
                        <input name="name" placeholder="Brand or Company Name" value={brand?.name}
                            class="col-span-2 p-4 border-1" onChange={handleChange} />
                        <button type="submit" class="bg-blue-600 text-white p-4 rounded cursor-pointer"
                            onClick={e => buttonRef.current = e.target}>
                            Update
                        </button>
                    </form>
                </div>
            </div>

            <div class="w-full md:w-150 p-2">
                <div class="">
                    <h3 class="mt-8 mb-4 text-3xl text-center">Address</h3>
                    <p class="text-sm text-center py-2">This is the address put on invoice for your customers.</p>
                    <form class="w-full" onSubmit={update}>
                        <div class="bg-white rounded-lg w-full relative">
                            {/* Address Fields */}
                            <div class="space-y-2">
                                <input
                                    name="street"
                                    placeholder="Street address"
                                    value={brand?.address?.street}
                                    class="w-full border px-3 py-2"
                                />

                                <input
                                    name="unit"
                                    placeholder="Apartment, suite, unit (optional)"
                                    value={brand?.address?.unit}
                                    class="w-full border px-3 py-2"
                                />

                                <div class="grid grid-cols-2 gap-2">
                                    <input
                                        name="city"
                                        placeholder="City"
                                        value={brand?.address?.city}
                                        class="border px-3 py-2"
                                    />

                                    <input
                                        name="state"
                                        placeholder="State / Province"
                                        value={brand?.address?.state}
                                        class="border px-3 py-2"
                                    />
                                </div>

                                <div class="grid grid-cols-2 gap-2">
                                    <input
                                        name="zipcode"
                                        placeholder="ZIP / Postal Code"
                                        value={brand?.address?.zipcode}
                                        class="border px-3 py-2"
                                    />

                                    <input
                                        name="country"
                                        placeholder="Country"
                                        value={brand?.address?.country}
                                        class="border px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div class="flex gap-3 mt-2">
                                <button
                                    type="submit"
                                    class="flex-1 bg-blue-600 text-white py-4 rounded"
                                    onClick={e => buttonRef.current = e.target}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div class="w-full md:w-150 p-2">
                <h3 class="mt-8 mb-4 text-3xl text-center">Email for Deposit</h3>
                <form class="flex flex-col gap-2" onSubmit={update}>
                    <div class="w-full grid grid-cols-3 gap-2">
                        <input name="depositEmail" placeholder="Email for online banking deposit (Interac for Canada)"
                            value={brand?.depositEmail}
                            class="col-span-2 p-4 border-1" />
                        <button type="submit" class="bg-blue-600 text-white p-4 rounded cursor-pointer"
                            onClick={e => buttonRef.current = e.target}>
                            Update
                        </button>
                    </div>
                    <label>
                        <p class="text-sm">
                            <input name="uniqueIdentifier" type="checkbox" checked={false} /> Add unique identifier to email for each transaction (Enabled by default)
                        </p>
                        <p class="ml-5 text-xs">
                            OpenSpend adds <i>+unique_identifier</i> suffix to your email part before @ to uniquely identify each transaction.
                        </p>
                    </label>
                </form>
            </div>

            <div class="w-full md:w-150 p-2">
                <h3 class="mt-8 mb-4 text-3xl text-center">Currency</h3>
                <form class="flex flex-col gap-2" onSubmit={update}>
                    <p>Currency Symbol ($, €, etc)</p>
                    <input name="currencySymbol" placeholder="$" value={brand?.currencySymbol}
                        class="col-span-2 p-4 border-1" />
                    <p>Currency (USD, EUR, GBP, CAD, AUD)</p>
                    <input name="currency" placeholder="USD, EUR, GBP, CAD, AUD" value={brand?.currency}
                        class="col-span-2 p-4 border-1" />
                    <button type="submit" class="bg-blue-600 text-white p-4 rounded cursor-pointer"
                        onClick={e => buttonRef.current = e.target}>
                        Update
                    </button>
                </form>
            </div>

            <div class="p-2">
                <h3 class="mt-8 mb-4 text-3xl text-center">Taxes</h3>

                <div class="grid grid-cols-3 gap-2 border-b-1 mb-2">
                    <p>Tax Name</p>
                    <p>Tax Title</p>
                    <p>Tax Percent</p>
                </div>
                {brand && brand?.taxes && brand?.taxes.map(t => <div class="relative grid grid-cols-3 gap-2 flex items-center mt-2">
                    <p>{t.name}</p>
                    <p>{t.value}</p>
                    <p>{(t.percent || 0).toFixed(5)}</p>
                    <button class="absolute right-1 cursor-pointer" onClick={e => deleteTax(e, t)}>
                        <IoClose />
                    </button>
                </div>)}
                <form class="flex flex-col gap-2 mt-4" onSubmit={addTax}>
                    <div class="grid grid-cols-3 gap-2">
                        <input name="name" placeholder="Name (Provincial or QST)"
                            class="p-4 border-1" />
                        <input name="value" placeholder="Title (9.975%)"
                            class="p-4 border-1" />
                        <input name="percent" placeholder="Percent (0.09975)"
                            class="p-4 border-1" />
                    </div>
                    <button type="submit" class="bg-blue-600 text-white p-4 rounded cursor-pointer"
                        onClick={e => buttonRef.current = e.target}>
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
}
