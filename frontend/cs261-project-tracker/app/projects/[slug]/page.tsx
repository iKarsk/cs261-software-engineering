'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';


export default function Page({
    params,
    searchParams,
  }: {
    params: { slug: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }) {

    const {status, data} = useSession();
    const [project, setProject] = useState({});


    useEffect(() => {
        if (status === "unauthenticated") redirect("/login");

        if (status === "authenticated"){
            const lastIndex = params.slug.lastIndexOf("-");
            const projectid = params.slug.slice(lastIndex + 1);
            let isnum = /^\d+$/.test(params.slug.slice(lastIndex + 1));
    
            if(lastIndex === -1 || !isnum){
                redirect("/dashboard");
            }else{
                console.log(projectid);

                const fetchData = async () => {
                    const endpoint = "/api/project/getProject";

                    const options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({userid: data?.user.id, projectid: projectid}),
                    };

                    const response = await fetch(endpoint, options);

                    if(response.status === 200){
                        const json = await response.json();
                        setProject(json);
                    }
                };

                fetchData().catch(console.error);

                if(Object.keys(project).length === 0 && project.constructor === Object){
                    redirect("/dashboard");
                }
        

            }
        }

    });

    return(
        <h1>My Page</h1>
    );
  }
  