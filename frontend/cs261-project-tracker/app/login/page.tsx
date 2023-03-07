'use client';

import styles from './page.module.css'
import Link from 'next/link';
import { signIn, useSession } from "next-auth/react"
import { redirect } from 'next/navigation';
import { useEffect, useState } from "react";
import Router from 'next/router'
import Loading from '@/components/loading';
import { Divider, Box, Button, Flex, FormControl, FormLabel, Heading, Input, CircularProgress, InputGroup, InputRightElement } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import ErrorMessage from '@/components/ErrorMessage';

export default function Home() {
    const {status, data} = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const passwordVisibility = () => setShowPassword(!showPassword);

    const handleSubmit = async (event : any) => {
        event.preventDefault();
        setLoading(true);

        const res = await signIn('credentials', {
            email: event.target.email.value,
            password: event.target.password.value,
            redirect: false,
            callbackUrl: "/dashboard"
        });
        
        if (res?.error === "CredentialsSignin") {
            setError("Invalid email or password");
        } else{
            setError("Internal server error. Please try again later.");
        }

        setLoading(false);
        setShowPassword(false);
    }

    useEffect(() => {
        if (status === "authenticated") redirect("/dashboard");
    }, [status]);

    

    if (status === "unauthenticated") {
        return (
            <Flex width="100vw" height="100vh" align="center" justifyContent="center">
                <Box p={8} width="clamp(300px, 40%, 400px)" borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Box textAlign="center">
                        <Heading>Login</Heading>
                    </Box>
                    <Box my={4} textAlign="left">
                        <form onSubmit = {handleSubmit}>
                            {error && <ErrorMessage message={error} />}
                            <FormControl isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input type="email" placeholder="johndoe@email.com" id="email"/>
                            </FormControl>
                            <FormControl mt={6} isRequired>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <Input type={showPassword ? 'text' : 'password'} placeholder="********" id="password" />
                                    <InputRightElement width="3rem">
                                        <Button h="1.5rem" size="sm" onClick={passwordVisibility}>
                                            {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <Button type="submit" colorScheme="teal" variant="outline" width="full" mt={4}>
                                {loading ? (<CircularProgress isIndeterminate size="24px" color="teal" />) : ('Sign in')}
                            </Button>
                        </form>
                        <Divider mt={6}/>
                        <Heading as='h5' size='xs' textAlign='center' mt={4}>Don't have an account?</Heading>
                        <Button as={Link} href="/signup" size="sm" colorScheme="teal" variant="outline" width="full" mt={4}>Sign Up</Button>
                    </Box>
                </Box>
            </Flex>
            /*
            <div className={styles.container}>  
                <form onSubmit = {handleSubmit}>
                    <div id={styles.formBox}>
                        <label htmlFor="email">Email</label>
                        <input className={styles.input} type="email" id="email" name="email" required/>
    
                        <label htmlFor="password">Password</label>
                        <input className={styles.input} type="password" id="password" name="password" required/>
    
                        <button type="submit">Submit</button>
                    </div>
                </form>
                <div id={styles.formBox}>
                    <hr className={styles.solid}/>
                    <Link href="/signup"><button type="button">Sign up</button></Link>
                </div>
                
            </div>
            */
        )
    }

    return <Loading />;


  
}
