import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import ldap from "ldapjs";
import { verifyOTP } from "../../../../lib/auth";

export const authOptions: NextAuthOptions = {
    debug: true, // 🔥 IMPORTANT: enables NextAuth logs

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        // ================= LDAP =================
        CredentialsProvider({
            id: "ldap",
            name: "LDAP",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                console.log("🔐 LDAP LOGIN ATTEMPT");

                if (!credentials?.username || !credentials?.password) {
                    console.log("❌ Missing credentials");
                    return null;
                }

                const ldapUrl = process.env.LDAP_URI!;
                const ldapUserDn = process.env.LDAP_USER_DN!;
                const ldapDomain = process.env.LDAP_DOMAIN!;

                const userDn = `uid=${credentials.username},${ldapUserDn}`;

                const client = ldap.createClient({
                    url: ldapUrl,
                    timeout: 8000,
                    connectTimeout: 8000,
                });

                try {
                    await new Promise<void>((resolve, reject) => {
                        client.bind(userDn, credentials.password, (err: Error) => {
                            if (err) {
                                console.log("❌ LDAP bind failed");
                                return reject(err);
                            }
                            resolve();
                        });
                    });

                    client.unbind();

                    console.log("✅ LDAP SUCCESS");

                    return {
                        id: credentials.username,
                        email: `${credentials.username}@${ldapDomain}`,
                        name: credentials.username,
                    };
                } catch (err) {
                    console.error("❌ LDAP ERROR:", err);
                    try {
                        client.unbind();
                    } catch { }
                    return null;
                }
            },
        }),

        // ================= OTP =================
        CredentialsProvider({
            id: "verify-otp",
            name: "OTP",
            credentials: {
                email: {},
                otp: {},
                userId: {},
            },

            async authorize(credentials) {
                console.log("🔐 OTP LOGIN");

                if (!credentials?.email || !credentials?.otp || !credentials?.userId) {
                    return null;
                }

                const isValid = verifyOTP(credentials.userId, credentials.otp);

                if (!isValid) {
                    console.log("❌ OTP invalid");
                    return null;
                }

                console.log("✅ OTP success");

                return {
                    id: credentials.userId,
                    email: credentials.email,
                    name: credentials.userId,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24, // 1 day
    },

    pages: {
        signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user }) {

            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }

            return token;
        },

        async session({ session, token }) {

            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }

            return session;
        },
    },

    events: {
        signIn(message) {
            console.log("🎉 SIGN IN EVENT:", message);
        },
        signOut(message) {
            console.log("👋 SIGN OUT EVENT:", message);
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };