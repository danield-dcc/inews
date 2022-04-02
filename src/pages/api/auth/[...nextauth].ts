import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "user:email",
        },
      },
    }),
    // ...add more providers here
  ],

  callbacks: {
    //@ts-ignore
    async signIn({ user, account, profile, credentials }): Promise<boolean> {
      //pegar estes dados e salvar no banco de dados quando o usuario logar
      //query para salvar o usuario no banco de dados
      console.log(user);
      const { email } = user;

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index("user_by_email"), q.Casefold(user.email))
              )
            ),
            q.Create(q.Collection("users"), {
              data: { email },
            }),
            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(user.email)))
          )
        );

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});
