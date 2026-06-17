export default function Home({ user }) {
    return (
        <main className="text-gray-800">
            {/* HERO */}
            <section className="bg-gradient-to-br from-blue-50 to-white pt-24 pb-32">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
                    <div>
                        <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
                            Invoicing ❤️<br />
                            <span className="text-blue-600">that just works.</span>
                        </h1>
                        <p className="mt-5 text-lg text-gray-600 max-w-lg">
                            Open-source and Low-cost invoicing software for <i>creators, freelancers, popup shops</i> and <i>small businesses</i> with guided Zelle and Interac Canada integrations
                        </p>
                        <p className="mt-6 text-2xl">
                            Stripe 💔 | PayPal 💔 | OpenSpend ❤️
                        </p>

                        <div className="mt-8 flex gap-4">
                            <a href="https://app.openspend.riamu.io" className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium shadow hover:bg-blue-700 transition">Try Now</a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <div className="flex items-center justify-center bg-gray-200 text-green-400 font-mono text-sm rounded-lg shadow-lg p-6 overflow-x-auto">
                            <img src="/assets/img/Screenshot1.jpg" width="50%" />
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
                            $0.129 per dollar of invoice
                        </p>
                        <p className="mt-2 text-lg text-gray-600 max-w-lg">
                            Volume pricing as low as $0.01
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

            {/* FEATURES */}
            <section id="why" className="bg-white py-24">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-12 text-gray-900">Why OpenSpend?</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Self Hosted",
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
        </main>
    );
}
