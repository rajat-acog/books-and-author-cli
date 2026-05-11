import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string; // ✅ ADD THIS
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: string; // ✅ ADD THIS
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}