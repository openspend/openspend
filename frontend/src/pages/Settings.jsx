import { useEffect, useState } from 'preact/hooks';

export function Settings() {
    const [code, setCode] = useState("")
    const [email, setEmail] = useState("");
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
            <p class="mt-4 mb-10 text-4xl text-center">Settings</p>
            <p>TO-DO</p>
        </div>
    );
}
