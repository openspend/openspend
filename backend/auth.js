import { betterAuth } from "better-auth";
import { admin as adminAsAdminPlugin, createAuthMiddleware } from "better-auth/plugins"
import { pool } from "./lib/postbase/db.js";
//import { phoneNumber } from "better-auth/plugins"
import { makePostbaseAdminClient } from "./lib/postbase/adminClient.js";

// Enable if required
const db = makePostbaseAdminClient({ pool });

export const auth = betterAuth({
    // Following is only needed for local testing
    // You can avoid this by using /etc/hosts and nginx servers
    // baseURL: 'http://localhost:8081',
    // trustedOrigins: ["http://localhost:8081", "http://localhost:5173", "http://localhost:5174"],
    // advanced: {
    //     defaultCookieAttributes: {
    //         sameSite: "none",
    //         secure: true,
    //         httpOnly: true,
    //     },
    //     crossSubDomainCookies: {
    //         enabled: true,
    //         domain: "localhost",
    //     },
    // },
    database: pool,
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            // await sendEmail({
            //     to: user.email,
            //     subject: "Reset your password",
            //     text: `Click the link to reset your password: ${url}`,
            // });
        },
        // onPasswordReset: async ({ user }, request) => {
        //     // your logic here
        //     console.log(`Password for user ${user.email} has been reset.`);
        // },
    },
    // emailVerification: {
    //     sendVerificationEmail: async ({ user, url }) => {
    //         // Send email using third-party APIs or your own SMTP server
    //         await sendEmail({
    //             to: user.email,
    //             subject: "Verify your email address",
    //             text: `Click the link to verify your email: ${url}`,
    //         });
    //     },
    //     sendOnSignIn: true,
    // },
    socialProviders: {
        // Enable following for Sign in with Google
        // google: {
        //     prompt: "select_account",
        //     clientId: process.env.GOOGLE_CLIENT_ID,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // },
    },
    user: {
        deleteUser: {
            enabled: true, // this is required to delete the user
            beforeDelete: async (user) => {
                // Optionally delete relevant relation if you were storing any
                // try {
                //     await db.collection('users').doc(user.id).delete();
                // } catch (err) {
                //     console.error('Error cleaning up users', err);
                // }
            },
        }
    },
    plugins: [
        adminAsAdminPlugin({
            adminUserIds: [
                process.env.VITE_BRAND_ID_USD,
                process.env.VITE_BRAND_ID_CAD,
            ],
        }),
        // phoneNumber({
        //     sendOTP: ({ phoneNumber, code }, request) => {
        //         // Implement sending OTP code via SMS
        //     }
        // })
    ],
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            const user = ctx.context.newSession?.user;
            if (user && (
                ctx.path.startsWith('/callback/:id') || // this will be repeated everytime user signs in with google
                ctx.path.startsWith('/sign-up'))) { // this will be only run once
                // so design the following accordingly

                let firstName = "";

                if (user?.name) {
                    const [_firstName, _lastName] = user.name.split(' ');
                    firstName = _firstName;
                }

                let profilePicUrl = null;

                if (user?.image && user?.image.length > 0) {
                    profilePicUrl = user.image;
                }

                try {
                    const userRef = db.collection('users_public').doc(user.id);
                    const userDoc = await userRef.get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        if (userData?.profilePicUrl && userData.profilePicUrl.indexOf("googleusercontent.com") === -1) {
                            profilePicUrl = userData.profilePicUrl;
                            console.log('user.profilePicUrl already exists');
                        }
                    }
                } catch (err) {
                }

                if (profilePicUrl && profilePicUrl.indexOf("googleusercontent.com") !== -1) {
                    try {
                        // download and upload to local server and change profilePicUrl
                        const fileName = user.name.toLowerCase().replace(/[\s-]+/g, '_');
                        const response = await fetch(profilePicUrl);
                        const mimeType = response.headers['content-type'];
                        const data = await response.blob();
                        let fileExt = "";
                        if (mimeType || data.type) {
                            fileExt = mime.getExtension(mimeType || data.type) || "";
                            if (fileExt && fileExt.length > 0) {
                                fileExt = "." + fileExt;
                            } else {
                                fileExt = "";
                            }
                        }
                        const profilePicFile = new File([data], fileName, { type: mimeType || data.type });
                        const arrayBuffer = await profilePicFile.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);

                        // Upload files
                        const filePath = `profile_pics/${user.id}/${Date.now()}_${profilePicFile.name}${fileExt}`;
                        const fileObj = bucket.file(filePath);
                        await fileObj.save(buffer, { contentType: mimeType || data.type });

                        profilePicUrl = fileObj.publicUrl();
                        await db.collection('users').doc(user.id).set({ profilePicUrl }, { merge: true });
                        await db.collection('users_public').doc(user.id).set({ profilePicUrl }, { merge: true });
                    } catch (err) {
                        console.warn('Error processing image from google sign in', err);
                    }

                    try {
                        const userRef = db.collection('users_public').doc(user.id);
                        const userDoc = await userRef.get();
                        const userData = userDoc.data() || {};
                        let newData;
                        if (!userDoc.exists || !userData?.createdAt) {
                            newData = {
                                firstName,
                                profilePicUrl,
                                createdAt: Timestamp.now()
                            };
                        } else {
                            newData = {
                                profilePicUrl,
                            };
                        }
                        await userRef.set(newData, { merge: (!userDoc?.exists || !userData?.createdAt) });
                    } catch (err) {
                        console.error('Error creating users_public', err);
                    }

                    // FIXME: results in error { status: 401, statusText: 'Unauthorized' }
                    // try {
                    //     const { data, error } = await authClient.updateUser({
                    //         name: user.name,
                    //         image: profilePicUrl,
                    //     });
                    //     if (error) {
                    //         throw error;
                    //     }
                    //     console.log('data', data);
                    // } catch (err) {
                    //     console.error('Error updating image in user', err);
                    // }

                    // TODO:
                    // try {
                    //     const receiverId = process.env.ADMIN_USER_ID; // umr.ashrf@gmail.com
                    //     const receiverRef = db.collection('push_subscriptions').doc(receiverId);
                    //     const receiverDoc = await receiverRef.get();
                    //     const receiver = receiverDoc.data();

                    //     const subscription = receiver.pushSubscription;
                    //     const payload = {
                    //         "title": `New Sign Up`,
                    //         "body": `${user.name} just signed up: ${user.email}`,
                    //     };
                    //     const options = { TTL: 60 * 60 * 1000 }; // 1 hour ttl

                    //     await webPush.sendNotification(subscription, JSON.stringify(payload), options);

                    // } catch (err) {
                    //     console.warn('Could not send a push notification when a new user signed up', err);
                    // }
                }
            }

            if (user && ctx.path.startsWith('/sign-in')) {
                try {
                    await db.collection('users').doc(user.id).set({
                        lastLogin: FieldValue.serverTimestamp(),
                    }, { merge: true });

                } catch (err) {
                    console.warn('Could not set lastLogin of the user:', user.email);
                }

            } else if (user && ctx.path.startsWith('/sign-up')) {
            }
        })
    },
});
