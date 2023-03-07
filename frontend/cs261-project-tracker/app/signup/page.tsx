'use client';

import styles from './page.module.css'
import Link from 'next/link';
import { signIn, useSession } from "next-auth/react"
import { redirect } from 'next/navigation';
import { useEffect, useState } from "react";
import Loading from '@/components/loading';
import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, CircularProgress, InputGroup, InputRightElement } from '@chakra-ui/react';
import ErrorMessage from '@/components/ErrorMessage';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'


export default function Home() {
    const {status, data} = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const passwordVisibility = () => setShowPassword(!showPassword);

    const handleSubmit = async (event : any) => {
        event.preventDefault();

        setLoading(true);

        const data = {
            forename: event.target.forename.value,
            surname: event.target.surname.value,
            yearsofexperience: Number(event.target.experience.value),
            email: event.target.email.value,
            password: event.target.password.value,
        };

        const JSONdata = JSON.stringify(data);

        const endpoint="/api/user/signup";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };


        const response = await fetch(endpoint, options);
        console.log(response);

        if (response.status === 200 || response.status === 201) {
            setLoading(false);
            const res = await signIn('credentials', {
                email: event.target.email.value,
                password: event.target.password.value,
                redirect: false,
                callbackUrl: "/dashboard"
            });
        } else if(response.status == 409){
            setLoading(false);
            setError("Email already exists");
        }else{
            setLoading(false);
            setError("Internal server error. Please try again later.");
        }
    }

    useEffect(() => {
        if (status === "authenticated") redirect("/dashboard");
    }, [status]);


    

    if (status === "unauthenticated"){
        return (
            
            <Flex width="100vw" height="100vh" align="center" justifyContent="center">
            <Box p={8} maxWidth="600px" borderWidth={1} borderRadius={8} boxShadow="lg">
                <Box textAlign="center">
                    <Heading>Sign Up</Heading>
                </Box>
                <Box my={4} textAlign="left">
                    <form onSubmit = {handleSubmit}>
                        {error && <ErrorMessage message={error} />}
                        <FormControl isRequired>
                            <FormLabel>Forename</FormLabel>
                            <Input type='text' id='forename' placeholder='John' />
                        </FormControl>
                        <FormControl mt={6} isRequired>
                            <FormLabel>Surname</FormLabel>
                            <Input type='text' id='surname' placeholder='Doe' />
                        </FormControl>
                        <FormControl mt={6} isRequired>
                            <FormLabel>Years of Experience</FormLabel>
                            <Input type='number' id='experience' placeholder='0' />
                        </FormControl>
                        <FormControl mt={6} isRequired>
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
                </Box>
            </Box>
        </Flex>
        
            /*
            <div className={styles.container}>  
                <form onSubmit = {handleSubmit}>
                    <div id={styles.formBox}>
                        <label htmlFor="forename">Forename</label>
                        <input className={styles.input} type="text" id="forename" name="forename" required/>
    
                        <label htmlFor="surname">Surname</label>
                        <input className={styles.input} type="text" id="surname" name="surname" required/>
    
                        <label htmlFor="experience">Years of Experience</label>
                        <input className={styles.input} type="number" id="experience" name="experience" required/>
    
                        <label htmlFor="email">Email</label>
                        <input className={styles.input} type="email" id="email" name="email" required/>
    
                        <label htmlFor="password">Password</label>
                        <input className={styles.input} type="password" id="password" name="password" required/>
    
                        <button type="submit">Submit</button>
                    </div>
                </form>
                
            </div>
            */
        )
    }

    return <Loading />;

}
