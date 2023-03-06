'use client';

import styles from './page.module.css'
import Link from 'next/link';
import { signIn, useSession } from "next-auth/react"
import { redirect } from 'next/navigation';
import { useEffect } from "react";
import Loading from '@/components/loading';

export default function Home() {
    const {status, data} = useSession();

    const handleSubmit = async (event : any) => {
        event.preventDefault();

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
            const res = await signIn('credentials', {
                email: event.target.email.value,
                password: event.target.password.value,
                redirect: false,
                callbackUrl: "/dashboard"
            });
        }
    }

    useEffect(() => {
        if (status === "authenticated") redirect("/dashboard");
    }, [status]);


    

    if (status === "unauthenticated"){
        return (
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
        )
    }

    return <Loading />;

}
