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
            async authorize(credentials, req){
                
            }
        })
    ]
}; 

export default NextAuth(authOptions);