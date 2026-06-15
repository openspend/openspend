import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { signUp, signIn, signOut } from '../auth';
import { db } from '../postbase';
import { Timestamp } from '../../lib/postbase/db';

function useQuery() {
    const location = useLocation();
    return new URLSearchParams(location.url.split('?')[1]);
}

export default function AuthPanel({ user }) {
    const query = useQuery();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redirectUrl, setRedirectUrl] = useState('/');

    useEffect(() => {
        const redirectUrl = query.get('redirectUrl');

        if (redirectUrl && redirectUrl.length > 0) {
            setRedirectUrl(redirectUrl);
        } else {
            setRedirectUrl('/');
        }
    }, []);

    const loginWithGoogle = async () => {
        alert("Finish setting up Sign in with Google. Learn more at https://www.better-auth.com/docs/authentication/google")
        await signIn.social({
            provider: "google",
            callbackURL: import.meta.env.VITE_FRONTEND_URL + '/'
        });
    };

    return (
        <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold">Account</h3>
            {!user ? (
                <div className="mt-3 space-y-3">
                    {/* <button onClick={loginWithGoogle} className="w-full bg-red-600 text-white py-2 rounded">Sign in with Google</button> */}

                    <div className="flex gap-2">
                        <input className="flex-1 border p-2 rounded w-full" type="text" placeholder="email" value={email} onInput={e => setEmail(e.target.value)} />
                        <input className="flex-1 border p-2 rounded w-full" type="password" placeholder="password" value={password} onInput={e => setPassword(e.target.value)} />
                    </div>

                    <div className="flex justify-center gap-2">
                        <button className="px-3 py-2 border rounded"
                            onClick={async () => {
                                await signUp.email(
                                    { email, password, name: email.split('@', 1)[0], callbackURL: redirectUrl },
                                    {
                                        onRequest: (ctx) => {
                                            //show loading
                                        },
                                        onSuccess: async (ctx) => {
                                            const { id, name, email, emailVerified, image, createdAt, updatedAt } = ctx.data.user;

                                            let firstName = "";
                                            let lastName = "";

                                            if (name) {
                                                const [_firstName, _lastName] = name.split(' ');
                                                firstName = _firstName;
                                                lastName = _lastName;
                                            }

                                            await db.collection('users').doc(id).set({
                                                firstName,
                                                lastName,
                                                email,
                                                emailVerified,
                                                profilePicUrl: image,
                                                createdAt: Timestamp.fromDate(createdAt),
                                                updatedAt: Timestamp.fromDate(updatedAt),
                                            });

                                            await db.collection('users_public').doc(id).set({
                                                firstName,
                                                profilePicUrl: image,
                                            });

                                            // redirect to the dashboard or sign in page
                                            window.location = import.meta.env.VITE_FRONTEND_URL;
                                        },
                                        onError: (ctx) => {
                                            // display the error message
                                            console.error('Sign up failed', ctx);
                                            alert('Sign up failed');
                                        },
                                    });
                            }}>
                            Sign up
                        </button>
                        <button className="px-3 py-2 border rounded"
                            onClick={async () => {
                                await signIn.email({ email, password, callbackURL: redirectUrl });
                            }}>
                            Login
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3">
                    <div className="flex items-center gap-3">
                        <img src={user.image} className="w-10 h-10 rounded-full" />
                        <div>
                            <div className="font-medium">{user.name || user.email}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <a href="/dashboard" className="px-3 py-2 border rounded">Dashboard</a>
                        <a href="/billing" className="px-3 py-2 border rounded">Billing</a>
                        <button onClick={() => signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    location.href = import.meta.env.VITE_FRONTEND_URL;
                                },
                            },
                        })} className="px-3 py-2 border rounded cursor-pointer">Logout</button>
                    </div>
                </div>
            )}
        </div>
    );
}
