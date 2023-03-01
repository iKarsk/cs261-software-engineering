'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { redirect } from 'next/navigation';
import styles from './page.module.css'
import { Divider } from '@chakra-ui/react'

export default function Dashboard() {
    const {status, data} = useSession();
    
    useEffect(() => {
        if (status === "unauthenticated") redirect("/login");
    }, [status]);


    if (status === "authenticated"){
        return (
            <div className={styles.container}>
                <h1>Welcome! You are signed in and can access this page.</h1>
                <h2>{JSON.stringify(data.user, null, 2)}</h2>

                <Divider />


            </div>
        );
    }

    return <div>Loading...</div>
}