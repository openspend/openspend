import { useState, useEffect } from 'preact/hooks';
import { getAuth, signOut } from '../auth';

export default function Header({ user }) {
    const [menu, setMenu] = useState(false);
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
                <nav className="flex gap-8 text-lg font-medium">
                    <a href="/invoice" className="text-blue-600 hover:underline">Create New</a>
                    <a href="/search" className="text-blue-600 hover:underline">Search</a>
                    <a href="/settings" className="text-blue-600 hover:underline">Settings</a>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 px-3 py-1 border rounded-md hover:bg-gray-50">
                                <img src={user.image ?? '/assets/img/blank-profile-picture-960_720.webp'} className="w-8 h-8 rounded-full" alt="profile" />
                                <span className="hidden sm:inline text-sm">{user.name || user.email}</span>
                            </button>
                            {menu && (
                                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg w-48 z-50">
                                    <a href="/dashboard" className="block px-4 py-2 hover:bg-gray-50">Dashboard</a>
                                    <a href="/billing" className="block px-4 py-2 hover:bg-gray-50">Billing</a>
                                    <button onClick={() => {
                                        signOut(getAuth());
                                        location.href = import.meta.env.VITE_FRONTEND_URL;
                                    }} className="w-full text-left px-4 py-2 hover:bg-gray-50 cursor-pointer">Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition">
                            Sign In
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
}
