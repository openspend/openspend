import { useState, useEffect } from 'preact/hooks';
//import { signOut } from '../auth';

export default function Header({ user }) {
    //const [menu, setMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={`w-full z-40 transition-all ${scrolled ? 'bg-white shadow' : 'bg-transparent'} backdrop-blur`}>
            <div className="flex flex-col md:flex-row items-center gap-1 max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <a href="/" className="text-2xl font-extrabold text-blue-600 mb-4 md:mb-0">OpenSpend</a>
                <nav className="flex gap-8 text-lg font-medium items-center justify-center">
                    <a href="#kiss" className="text-blue-600 hover:underline">KISS</a>
                    <a href="#payg" className="text-blue-600 hover:underline">Simple Pricing (PAYG)</a>
                    <a href="#why" className="text-blue-600 hover:underline">Why OpenSpend?</a>
                </nav>

                <div className="flex items-center gap-4">
                    <a href="https://app.openspend.riamu.io" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition">
                        Try
                    </a>
                </div>
            </div>
        </header>
    );
}
