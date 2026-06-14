import { useEffect, useState } from 'preact/hooks';
import { IoClose } from 'react-icons/io5';

export function Settings() {
    const [code, setCode] = useState("")
    const [brandName, setBrandName] = useState("CasaZero");
    const [email, setEmail] = useState("dasvilleda@gmail.com");
    const [currency, setCurrency] = useState("CAD");
    const [currencySymbol, setCurrencySymobol] = useState("$");
    const [amount, setAmount] = useState(0.01);

    const search = async (event) => {
        event.preventDefault();

        const uniqueIdentifier = generateSixDigitAlphanumeric();
        const formData = {
            email: `DASVILLEDA+${uniqueIdentifier}@GMAIL.COM`,
            currency,
            currencySymbol,
            amount,
            uniqueIdentifier,
        }

        const resp = await fetch(import.meta.env.VITE_API_BASE + '/invoice', {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        const data = await resp.json();
        const invoiceId = data.id;

        // generate qr code
    };

    return (
        <div class="w-full flex flex-col items-center">
            <h2 class="mt-4 mb-10 text-4xl text-center">Settings</h2>

            <div class="w-full md:w-150 p-2">
                <h3 class="mt-4 mb-10 text-3xl text-center">Brand / Company Name</h3>
                <form class="w-full grid grid-cols-3 gap-2">
                    <input name="email" placeholder="Brand or Company Name" value={brandName}
                        class="col-span-2 p-4 border-1" />
                    <button class="bg-blue-600 text-white p-4 rounded cursor-pointer">Update</button>
                </form>
            </div>

            <div class="w-full md:w-150 p-2">
                <h3 class="mt-4 mb-10 text-3xl text-center">Email for Deposit</h3>
                <form class="flex flex-col gap-2">
                    <div class="w-full grid grid-cols-3 gap-2">
                        <input name="email" placeholder="Email for online banking deposit (Interac for Canada)" value={email}
                            class="col-span-2 p-4 border-1" />
                        <button class="bg-blue-600 text-white p-4 rounded cursor-pointer">Update</button>
                    </div>
                    <label>
                        <p class="text-sm">
                            <input type="checkbox" checked disabled /> Add unique identifier to email for each transaction (Enabled by default)
                        </p>
                        <p class="ml-5 text-xs">
                            OpenSpend adds <i>+unique_identifier</i> suffix to your email part before @ to uniquely identify each transaction.
                        </p>
                    </label>
                </form>
            </div>

            <div class="p-2">
                <h3 class="mt-4 mb-10 text-3xl text-center">Taxes</h3>

                <div class="grid grid-cols-3 gap-2 border-b-1 mb-2">
                    <p>Tax Name</p>
                    <p>Tax Title</p>
                    <p>Tax Percent</p>
                </div>
                <div class="relative grid grid-cols-3 gap-2 flex items-center">
                    <p>TVQ</p>
                    <p>9.975%</p>
                    <p>{(9.975 / 100).toFixed(2)}</p>
                    <button class="absolute right-1 cursor-pointer">
                        <IoClose />
                    </button>
                </div>
                <div class="relative grid grid-cols-3 gap-2 flex items-center">
                    <p>TPS</p>
                    <p>5%</p>
                    <p>{(5 / 100).toFixed(2)}</p>
                    <button class="absolute right-1 cursor-pointer">
                        <IoClose />
                    </button>
                </div>
                <form class="flex flex-col gap-2 mt-4">
                    <div class="grid grid-cols-3 gap-2">
                        <input name="name" placeholder="Tax Name" value={email}
                            class="p-4 border-1" />
                        <input name="value" placeholder="Tax Title" value={email}
                            class="p-4 border-1" />
                        <input name="percent" placeholder="Tax Percent" value={email}
                            class="p-4 border-1" />
                    </div>
                    <button class="bg-blue-600 text-white p-4 rounded cursor-pointer">Add</button>
                </form>
            </div>
        </div>
    );
}
