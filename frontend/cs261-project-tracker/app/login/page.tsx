'use client';

import styles from './page.module.css'
import Link from 'next/link';
import { signIn, useSession } from "next-auth/react"
import { redirect } from 'next/navigation';
import { useEffect } from "react";

export default function Home() {
    const {status, data} = useSession();

    const handleSubmit = async (event : any) => {
        event.preventDefault();

        const res = await signIn('credentials', {
            email: event.target.email.value,
            password: event.target.password.value,
            redirect: false,
            callbackUrl: "/dashboard"
        });
    }

    useEffect(() => {
        if (status === "authenticated") redirect("/dashboard");
    }, [status]);

    if (status === "loading") return <div>Loading...</div>;

    return (
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
            
        </div>
    )

  
}
