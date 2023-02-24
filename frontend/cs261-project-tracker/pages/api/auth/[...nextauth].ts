import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@test.com" },
                password: {  label: "Password", type: "password" }
            },
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
    secret: process.env.JWT_SECRET,
    session: { strategy: 'jwt' },
}; 

export default NextAuth(authOptions);