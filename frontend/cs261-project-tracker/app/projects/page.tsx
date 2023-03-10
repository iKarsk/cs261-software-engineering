'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/components/loading';

export default function Projects() {

    useEffect(() => {
        redirect("/dashboard");
    }, []);

    return(
        <Loading />
    );

}