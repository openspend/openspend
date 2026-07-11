import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';

import { requestPasswordReset } from '../../auth';

import './style.css';

function useQuery() {
    const location = useLocation();
    return new URLSearchParams(location.url.split('?')[1]);
}

export default function ResetPassword() {
    const query = useQuery();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }

        try {
            await requestPasswordReset({
                email,
                redirectTo: import.meta.env.VITE_FRONTEND_URL + '/new-password'
            });

            alert("Reset password email sent, please check your email.");

            const redirectUrl = query.get('redirectUrl');

            if (redirectUrl && redirectUrl.length > 0) {
                location.route(redirectUrl);
            } else {
                location.route('/');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div class="w-max mt-40 m-auto">
            <h1 class="text-4xl mb-2 text-gray-500">Reset Password</h1>
            {error && <p class="error">{error}</p>}
            <form onSubmit={handleSubmit} class="w-full items-center p-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    class="p-3 border-1 border-gray-200 rounded w-full my-2"
                    onInput={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" class="border-1 shadow rounded bg-gray-200 px-8 py-4 mt-4">Reset</button>
            </form>
            <div class="flex flex-col">
                <a href="/" class="mt-10">
                    Already have an account? Login
                </a>
                <a href="/signup" class="mt-10">
                    Need an account? Sign up
                </a>
            </div>
        </div>
    );
}