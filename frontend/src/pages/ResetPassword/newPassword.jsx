import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';

import './style.css';

function useQuery() {
    const location = useLocation();
    return new URLSearchParams(location.url.split('?')[1]);
}

export default function NewPassword() {
    const query = useQuery();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!newPassword) {
            setError('New Password is required');
            return;
        }

        try {
            const resp = await fetch(import.meta.env.VITE_API_URL + '/user/new-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: query.get('token'),
                    newPassword,
                })
            });
            const data = await resp.json();
            if (data?.status !== 'ok') {
                throw new Error('500 Internal Error. Could not change password');
            }

            alert("New password has been set, please login");

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
            <h1 class="text-4xl mb-2 text-gray-500">Set New Password</h1>
            {error && <p class="error">{error}</p>}
            <form onSubmit={handleSubmit} class="w-full items-center p-4">
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    class="p-3 border-1 border-gray-200 rounded w-full my-2"
                    onInput={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="submit" class="border-1 shadow rounded bg-gray-200 px-8 py-4 mt-4">Submit</button>
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