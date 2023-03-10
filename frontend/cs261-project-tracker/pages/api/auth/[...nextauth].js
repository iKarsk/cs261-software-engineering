import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// export const authOptions: NextAuthOptions = {
export const authOptions = {
    providers: [
        CredentialsProvider({
            type: 'credentials',
            id: 'credentials',
            name: 'Credentials',
            credentials: {},
            authorize: async (credentials, req) => {
                const user = await fetch(
                    `${process.env.NEXTAUTH_URL}/api/user/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials),
                }).then((res) => res.json()).catch((err) => { return null; });

                if(user){
                    return user;
                }
                else{
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    secret: process.env.JWT_SECRET,
    session: { strategy: 'jwt' },
    callbacks: {
        async jwt({token, user}){
            if(user){
                token.id = user.id;
            }
            return token;
        },
        async session({session, token, user}){
            session.user.id = token.id;

            return session;
        }
    }
}; 

export default NextAuth(authOptions);