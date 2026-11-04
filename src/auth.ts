
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const testUsers = [
  {
    username: "wahyu",
    password: "Admin123!",
    name: "Wahyu Sandi",
    email: "wahyu.sandi@grahasurvei.com",
  },
  {
    username: "naomi",
    password: "Naomi123!",
    name: "Naomi Manurung",
    email: "naomi.manurung@grahasurvei.com",
  },
  {
    username: "fajar",
    password: "Fajar123!",
    name: "Fajar Chan",
    email: "fajar.chan@grahasurvei.com",
  },
];

const nextAuth = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Username dan Password",
      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const username = String(credentials?.username ?? "")
          .trim()
          .toLowerCase();

        const password = String(credentials?.password ?? "");

        const user = testUsers.find(
          (item) =>
            item.username === username &&
            item.password === password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.username,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },
});

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
