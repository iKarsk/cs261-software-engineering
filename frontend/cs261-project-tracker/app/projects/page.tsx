'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Projects() {

    useEffect(() => {
        redirect("/dashboard");
    }, []);

}