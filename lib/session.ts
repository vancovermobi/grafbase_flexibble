import { getServerSession } from "next-auth/next";
import { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jsonwebtoken from "jsonwebtoken";
import { JWT } from "next-auth/jwt";

import { SessionInterface, UserProfile } from '@/common.types';
import { createUser, getUser } from "./actions";


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  jwt: {
   encode: ({ secret, token }) => {
      const encodedToken = jsonwebtoken.sign({
        ...token,
        iss: 'grafbase',
        exp: Math.floor(Date.now()/1000) + 60*60
      }, secret)

      return encodedToken
    },
    decode: ({ secret, token }) => {
      const decodedToken = jsonwebtoken.verify(token!, secret)
      return decodedToken as JWT
    },
  },
  theme: {
    colorScheme: 'light',
    logo: '/logo.svg',
  },
  callbacks: {
    async session ({ session })  {
        // console.log('Session:', session);
        const email = session?.user?.email as string

        try {
          const data = await getUser(email) as { user?: UserProfile }

          const newSession = {
            ...session,
            user: {
              ...session.user,
              ...data?.user
            }
          }

          return newSession

        } catch (error: any) {
          console.log("Error retrieving user date: ", error);
          return session
        }        
    },
    async signIn ({ user }: { user:  User }) {
      //console.log('User_SignIn:', user);
        try {
            // get the user if they exits
            const userExits = await getUser(user?.email as string) as { user?: UserProfile }

            //console.log("userExits:", userExits);

            if(!userExits.user) {
              //console.log('user not exits. create new user');
              await createUser(
                user.name as string,
                user.email as string,
                user.image as string,
              )
              //console.log("create new user finish");
            }

            // if they don't exits, create them

            return true
        } catch (error: any) {
            console.log("Error_signIn: ", error);
            return false
        }
    },
    async redirect({ url, baseUrl }) {
      //this is the default behavior
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
     //Youcan add and modify it your usecase here
    },
  },

};

export async function getCurrentUser() {
    const session = await getServerSession(authOptions) as SessionInterface

    return session
}