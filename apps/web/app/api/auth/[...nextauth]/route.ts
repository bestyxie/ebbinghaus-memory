import { auth } from "@/app/lib/auth";
import { toNextJsHandler } from "better-auth/next-js"

// Better-auth route handler
// /api/auth/[...nextauth]
// export { auth as GET, auth as POST };
export const { GET, POST } = toNextJsHandler(auth);

