import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  // Super Admin Credentials (Exact match required)
  const SUPER_ADMIN_EMAIL = "admin@millystrust.com";
  const SUPER_ADMIN_PASSWORD = "MillyTrust2026!Secure";

  if (
    credentials.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase() &&
    credentials.password === SUPER_ADMIN_PASSWORD
  ) {
    return {
      id: "super-admin-001",
      name: "Milly's Trust Admin",
      email: SUPER_ADMIN_EMAIL,
      role: "super_admin",
    };
  }

  // If not Super Admin, return null (normal users will use localStorage fallback)
  return null;
            

       if (
  credentials!.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase() &&
  credentials!.password === SUPER_ADMIN_PASSWORD
        ) 
        {
          return {
            id: "super-admin-001",
            name: "Milly's Trust Admin",
            email: SUPER_ADMIN_EMAIL,
            role: "super_admin"
          };
        }

        // For normal users, we still allow demo login via localStorage method for now
        // In future this will connect to database
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "millys-trust-demo-secret-change-in-production",
});

export { handler as GET, handler as POST };
