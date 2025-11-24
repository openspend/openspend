import { useState } from 'preact/hooks';
import { MdCopyAll } from 'react-icons/md';

export function App() {
    const [open, setOpen] = useState(false);

    return (
        <div class="w-full flex flex-col items-center">
            <button
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setOpen(true)}
            >
                Pay
            </button>

            {/* Backdrop */}
            <div
                class={`
          fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
                onClick={() => setOpen(false)}
            />

            {/* Slide-up Dialog */}
            <div
                class={`
          fixed left-0 right-0 mx-auto max-w-md bg-white rounded-t-xl shadow-xl
          transition-transform duration-300
          ${open ? "translate-y-0 bottom-0" : "translate-y-full bottom-0"}
        `}
            >
                <div class="relative p-6 text-center">
                    <button
                        class="fixed top-0 right-0 mt-5 mr-4 px-4 py-2 text-gray-400 bg-gray-100 hover:bg-gray-300 rounded transition"
                        onClick={() => setOpen(false)}
                    >
                        X
                    </button>

                    <p class="text-gray-700 w-80 m-auto">
                        Send an online bank transfer
                    </p>

                    <h2 class="mt-4 text-3xl font-semibold">$19.99</h2>

                    <div>
                        <h3 class="mt-6 font-bold text-gray-500">Transfer to Email</h3>
                        <div class="relative flex items-center justify gap-2">
                            <p class="text-xl text-gray-700 font-bold w-full">customer_name@your_website.com</p>
                            <button class="fixed right-5 hover:bg-gray-300 rounded"
                                title="Copy Email"
                                onClick={e => {
                                    alert("customer_name@your_website.com");
                                }}>
                                <MdCopyAll size={24} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 class="mt-6 font-bold text-gray-500">Security Question:</h3>
                        <div class="relative flex items-center justify gap-2">
                            <p class="text-xl text-gray-700 font-bold w-full">Code</p>
                            <button class="fixed right-5 hover:bg-gray-300 rounded"
                                title="Copy Email"
                                onClick={e => {
                                    alert("Code");
                                }}>
                                <MdCopyAll size={24} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 class="mt-6 font-bold text-gray-500">Security Answer:</h3>
                        <div class="relative flex items-center justify gap-2">
                            <p class="text-xl text-gray-700 font-bold w-full">XA6J4@</p>
                            <button class="fixed right-5 hover:bg-gray-300 rounded"
                                title="Copy Email"
                                onClick={e => {
                                    alert("XA6J4@");
                                }}>
                                <MdCopyAll size={24} />
                            </button>
                        </div>
                    </div>

                    <div class="flex justify-center mt-6">
                        <div class="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
