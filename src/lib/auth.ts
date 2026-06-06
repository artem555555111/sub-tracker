import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "./db";

// Magic-link provider. In dev we don't send real email — the sign-in link is
// printed to the server console. Swap sendVerificationRequest for Resend in a
// later phase. Built as a plain EmailConfig object to avoid an SMTP dependency.
const magicLinkProvider = {
  id: "email",
  type: "email",
  name: "Email",
  from: process.env.EMAIL_FROM ?? "SubTrack <no-reply@localhost>",
  maxAge: 24 * 60 * 60,
  async sendVerificationRequest(params: { identifier: string; url: string }) {
    console.log(
      `\n🔗 Magic sign-in link for ${params.identifier}:\n${params.url}\n`,
    );
  },
} as unknown as Provider;

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    magicLinkProvider,
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      const id = (token.uid ?? token.sub) as string | undefined;
      if (id) session.user.id = id;
      return session;
    },
  },
});
