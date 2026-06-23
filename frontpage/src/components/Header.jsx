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
        <header className={`w-full z-40 rounded-none transition-all ${scrolled ? 'bg-white shadow' : 'bg-transparent'} backdrop-blur`}>
            <div class="flex flex-col md:flex-row items-center justify-center gap-1 text-center text-sm font-bold bg-green-200 text-green-700 px-2 py-1">
                <p>$600 Credit</p>
                <p>when you spend $600 within 60 days</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-1 max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <a href="/" className="text-2xl font-extrabold text-blue-600 mb-4 md:mb-0">OpenSpend</a>
                <nav className="grid grid-cols-2 gap-2 text-center md:flex md:flex-row md:gap-8 text-lg font-medium items-center justify-center">
                    <a href="#kiss" className="text-blue-600 hover:underline">KISS</a>
                    <a href="#payg" className="text-blue-600 hover:underline">PAYG Pricing</a>
                    <a href="#why" className="text-blue-600 hover:underline">Why OpenSpend?</a>
                    <a href="#demo" className="text-blue-600 hover:underline">Schedule Demo</a>
                </nav>

                <div className="flex items-center gap-4">
                    {/* Left this block to keep links in center */}
                </div>
            </div>
        </header>
    );
}
