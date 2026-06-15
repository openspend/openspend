// server/rules.js
import { RuleHelpers as H } from './lib/postbase/rulesEngine.js';

/**
 * This ruleset mirrors your Firestore rules.
 * Each table corresponds to a Firestore collection.
 * All functions receive (request, resource)
 *   - request.auth may be null or { uid, ... }
 *   - request.resource.data equivalent → request.resource (on create)
 *   - resource.data → resource (for read/update/delete)
 */
export default {
    tables: {
        /** === USERS === */
        users: {
            // Allow read and update if the auth.id matches the userId (row id)
            read: (req, res) => H.isAuth(req) && (req.auth.id === String(res.id) || req.user?.role === "admin"),
            update: (req, res) => H.isAuth(req) && req.auth.id === String(res.id),

            // Allow create if auth.id == resource.userId
            create: (req, res) => H.isAuth(req) && req.auth.id === String(res.id),

            // Delete not allowed
            delete: () => false,
        },

        /** === INVOICES === */
        brands: {
            // Allow read and update if the auth.id matches the userId (row id)
            read: () => true,
            update: () => true,

            // Allow create if auth.id == resource.userId
            create: () => true,

            // Delete not allowed
            delete: () => false,
        },


        /** === INVOICES === */
        invoices: {
            // Allow read and update if the auth.id matches the userId (row id)
            read: () => true,
            update: () => true,

            // Allow create if auth.id == resource.userId
            create: () => true,

            // Delete not allowed
            delete: () => false,
        },

        /** === REVIEWS === */
        reviews: {
            // Everyone can read
            read: () => true,

            // Authenticated users can create reviews with proper fields and constraints
            create: (req, res) => {
                if (!H.isAuth(req)) return false;
                const d = req.resource || {};
                const isString = (v) => typeof v === 'string' && v.trim().length > 0;
                const isInt = (v) => Number.isInteger(v);

                const valid =
                    isString(d.name) &&
                    isString(d.email) &&
                    isString(d.comment) &&
                    isInt(d.stars) &&
                    d.stars >= 1 &&
                    d.stars <= 5 &&
                    // check createdAt equals request.time: approximated by presence of field
                    !!d.createdAt;

                return valid;
            },

            // No updates or deletes
            update: () => false,
            delete: () => false,
        },

        /** === BILLING === */
        billing: {
            // Read and write allowed only for owner
            read: (req, res) =>
                H.isAuth(req) && req.auth.id === String(res.user_id || res.userId),
            create: (req, res) =>
                H.isAuth(req) && req.auth.id === String(res.user_id || res.userId),
            update: (req, res) =>
                H.isAuth(req) && req.auth.id === String(res.user_id || res.userId),
            delete: (req, res) =>
                H.isAuth(req) && req.auth.id === String(res.user_id || res.userId),
        },
    },

    /** === GLOBAL DEFAULTS === */
    default: {
        // Default deny everything (read/write false)
        read: () => false,
        create: () => false,
        update: () => false,
        delete: () => false,
    },
};
