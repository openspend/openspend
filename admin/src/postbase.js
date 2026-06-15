import { getDB } from "@postbase/frontend/db";
import { getBetterAuthToken } from "./auth";

export const db = getDB({
    baseUrl: import.meta.env.VITE_API_BASE + '/db',
    getAuthToken: getBetterAuthToken,
});
