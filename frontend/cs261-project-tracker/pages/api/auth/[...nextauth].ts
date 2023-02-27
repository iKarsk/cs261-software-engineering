import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
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
}; 

export default NextAuth(authOptions);