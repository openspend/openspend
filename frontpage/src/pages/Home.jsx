import { useRef } from "preact/hooks";

export default function Home({ user }) {
    const buttonRef = useRef(null);

    const scheduleDemo = async (event) => {
        event.preventDefault();

        try {
            if (buttonRef?.current) buttonRef.current.innerText = 'Submitting...';

            const formData = new FormData(event.target);
            const obj = Object.fromEntries(formData.entries());

            await fetch(import.meta.env.VITE_API_BASE + '/email/demo', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            });

            if (buttonRef?.current) buttonRef.current.innerText = '✅ Success';
        } catch (err) {
            if (buttonRef?.current) buttonRef.current.innerText = 'Error';

            setTimeout(() => {
                if (buttonRef?.current) buttonRef.current.innerText = 'Submit';
            }, 2000);
        }
    };

    return (
        <main className="text-gray-800">
            {/* HERO */}
            <section className="bg-gradient-to-br from-blue-50 to-white pt-10 pb-32">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
                    <div>
                        <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
                            Invoicing for <br />
                            <span className="text-blue-600">creators, <br />freelancers, <br />popup shops ❤️<br /></span>
                        </h1>
                        <p className="mt-5 text-3xl text-gray-600 max-w-lg">
                            Low-cost invoicing software for <span className="text-blue-600">creators, freelancers, popup shops</span> and <span className="text-blue-600">small businesses</span> with guided Zelle and Interac Canada integrations.
                        </p>
                        <p className="mt-6 text-2xl">
                            Instant same-day payouts.
                        </p>
                        <p className="mt-6 text-2xl">
                            Customers send money directly to your bank account.
                        </p>

                        <div className="mt-8 flex flex-col gap-2">
                            <a href="https://app.openspend.riamu.io" className="w-max bg-blue-600 text-4xl text-white px-6 py-3 rounded-md font-medium shadow hover:bg-blue-700 transition">Try for free</a>
                            <p class="text-3xl">No credit card required</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <div className="flex items-center justify-center bg-gray-200 text-green-400 font-mono text-sm rounded-lg shadow-lg p-6 overflow-x-auto">
                            <img src="/assets/img/Screenshot1.jpg" width="75%" />
                        </div>
                    </div>
                </div>
            </section>

            <section id="kiss" className="bg-gradient-to-br from-blue-50 to-white pt-24 pb-32">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
                    <div>
                        <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
                            Keep it simple stupid
                        </h1>
                        <p className="mt-5 text-lg text-gray-600 max-w-lg">
                            Get paid in just a few steps
                        </p>
                        <p className="mt-5 text-lg text-gray-600 max-w-lg">
                            No onboarding required.
                        </p>
                        <ol className="ml-5 mt-5 text-lg text-gray-600 max-w-lg list-decimal">
                            <li>Sign up</li>
                            <li>Add Money</li>
                            <li>Send invoice</li>
                            <li>Get paid</li>
                        </ol>

                        <p className="mt-5 text-lg text-gray-600 max-w-lg">
                            Instant payouts directly to your account. Zero delays.
                        </p>

                        <div className="mt-8 flex gap-4">

                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex items-center justify-center bg-gray-200 text-green-400 font-mono text-sm rounded-lg shadow-lg p-6 overflow-x-auto">
                            <img src="/assets/img/Screenshot2.jpg" width="50%" />
                        </div>
                    </div>
                </div>
            </section>

            <section id="payg" className="bg-gradient-to-br from-blue-50 to-white pt-24 pb-32">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
                    <div>
                        <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
                            Pay-as-you-go
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 max-w-lg">
                            $0.015 per dollar of invoice
                        </p>
                        <p className="mt-2 text-lg text-gray-600 max-w-lg">
                            Volume pricing are available
                        </p>
                        <p className="mt-2 text-lg text-gray-600 max-w-lg">
                            Start with as low as $10
                        </p>

                        <div className="mt-8 flex gap-4">
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <div className="flex items-center justify-center bg-gray-200 text-green-400 font-mono text-sm rounded-lg shadow-lg p-6 overflow-x-auto">
                            <img src="/assets/img/Screenshot4.jpg" width="50%" />
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY */}
            <section id="why" className="bg-white pt-24 pb-32">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-12 text-gray-900">Why OpenSpend?</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Open Source",
                                desc: "Based on mostly open source easily installable projects",
                                icon: "🧩"
                            },
                            {
                                title: "Cost Effective",
                                desc: "Avoid surprise charges",
                                icon: "💳"
                            },
                            {
                                title: "Scalable",
                                desc: "Scale to millions of invoices per day — no rate limits on your growth.",
                                icon: "⚡"
                            },

                        ].map(f => (
                            <div key={f.title} className="bg-gray-50 border rounded-lg p-8 shadow-sm hover:shadow transition">
                                <div className="text-4xl mb-3">{f.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                                <p className="text-gray-600">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="demo" className="bg-white pt-24 pb-32">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-12 text-gray-900">Schedule a Demo</h2>
                    <form onSubmit={scheduleDemo} className="w-max m-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-50 border rounded-lg p-8 shadow-sm hover:shadow transition">
                        {[
                            {
                                name: "name",
                                desc: "Your full name",
                                //icon: "🧩"
                            },
                            {
                                name: "company",
                                desc: "Your company name",
                                //icon: "💳"
                            },
                            {
                                name: "email",
                                desc: "Your work or business email address",
                                //icon: "⚡"
                            },
                            {
                                name: "phone",
                                desc: "Your work or business phone number",
                                //icon: "⚡"
                            }

                        ].map(f => (
                            <div key={f.name} className="flex flex-col gap-4">
                                {/* <div className="text-4xl mb-3">{f.icon}</div> */}
                                <label className="text-gray-600 font-semibold">{f.desc}</label>
                                <input name={f.name} class="border-1 px-4 py-2" required />
                            </div>
                        ))}
                        <div className="flex flex-col gap-4">
                            <label>When would you like this demo?</label>
                            <select name="urgency" class="border-1 px-4 py-2">
                                <option value="Low Priority">No rush</option>
                                <option value="ASAP">As soon as possible</option>
                                <option value="Urgent">It's urgent</option>
                            </select>
                        </div>
                        <button type="submit" class="p-4 bg-blue-600 text-white font-semibold hover:bg-blue-400 cursor-pointer rounded shadow"
                            onClick={e => buttonRef.current = e.target}
                            disabled={buttonRef?.current && buttonRef.current.innerText !== 'Submit'}>
                            Submit
                        </button>
                    </form>
                    <p>All fields are required</p>
                </div>
            </section>
        </main>
    );
}
