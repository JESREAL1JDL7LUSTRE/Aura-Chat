import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Your database-generated string ID
      name?: string | null; // Optional string, can be null
      email?: string | null; // Optional string, can be null
      image?: string | null; // Optional string, can be null
      // Add any other custom properties you want to expose in the session
    }
  }

  // You might also want to extend the User interface if you pass it around
  // or use it in other NextAuth.js callbacks.
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}