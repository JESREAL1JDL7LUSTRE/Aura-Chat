import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Import the adapter
import prisma from "@/lib/prisma"; // Import your Prisma client instance

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id; // Crucial: Add the database user ID
                session.user.email = user.email ?? null; // Explicitly set email from DB
                session.user.name = user.name ?? null; // Explicitly set name from DB
                session.user.image = user.image ?? null; // Explicitly set image from DB
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST };

