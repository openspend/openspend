import { useEffect, useState } from 'preact/hooks';
import { LocationProvider, Router, Route } from 'preact-iso';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { getSession } from './auth';
import { Invoice } from './pages/Invoice';
import { Pay } from './pages/Pay';
import { Search } from './pages/Search';

export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        (async () => {
            const { data } = await getSession();
            if (data && data.hasOwnProperty('user')) {
                setUser(data.user);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Header user={user} />

            <LocationProvider>
                <Router>
                    <Route path="/" component={Home} user={user} />
                    <Route path="/dashboard" component={Dashboard} user={user} />
                    <Route path="/login" component={Login} user={user} />
                    <Route path="/invoice" component={Invoice} user={user} />
                    <Route path="/invoice/:invoiceId" component={Invoice} user={user} />
                    <Route path="/pay/:invoiceId" component={Pay} user={user} />
                    <Route path="/search" component={Search} user={user} />
                </Router>
            </LocationProvider>

            <footer className="bg-white border-t py-6 mt-10">
                <div className="container mx-auto text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} OpenSpend
                </div>
            </footer>
        </div>
    );
}
