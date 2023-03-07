'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { useRouter } from "next/navigation";
import styles from './page.module.css'
import { Divider, Button, Box, useDisclosure, Heading, Text } from '@chakra-ui/react'
import Loading from "@/components/loading";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'

  import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    InputGroup,
    InputLeftElement
  } from '@chakra-ui/react'

import { Checkbox, CheckboxGroup } from '@chakra-ui/react';

export default function Page({
    params,
    searchParams,
  }: {
    params: { slug: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }) {

    const router = useRouter();
    const {status, data} = useSession();
    const [project, setProject] = useState({id : undefined, name : "", start_date : ""});
    const [loaded, setLoaded] = useState(false);
    const [email, setEmail] = useState("");
    const [manager, setManager] = useState(false);
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();



    useEffect(() => {
        if (status === "unauthenticated") redirect("/login");

        if (status === "authenticated"){
            const lastIndex = params.slug.lastIndexOf("-");
            const projectid = params.slug.slice(lastIndex + 1);
            let isnum = /^\d+$/.test(params.slug.slice(lastIndex + 1));
    
            if(lastIndex === -1 || !isnum){
                redirect("/dashboard");
            }else{


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
                        setLoaded(true);
                    }else{
                        router.push("/dashboard");
                    }
                };

                fetchData().catch(console.error);
        
            }
        }

    }, [status]);


    const handleInvites = async () => {
        onInviteOpen();

        const postData = {
	    project: project.id,
            email: email,
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/inviteDeveloper";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };
        const response = await fetch(endpoint, options);

	const responseJSON = await response.json();
	
	console.log(responseJSON);

	if (response.status === 201) {
		onInviteClose();
	}	

    }


    if (status === "authenticated" && loaded){
    return(
        <div className={styles.container}>
                <h1>Welcome! You are signed in and can access this page.</h1>
                <h2>{JSON.stringify(data.user, null, 2)}</h2>

                <Divider />

                <Heading as='h1' size='2xl'>{project.name}</Heading>

                <Text>{project.start_date.substring(0, 10)}</Text>

	    	<Button onClick={onInviteOpen} mt={5}>Invite User</Button>


	    	<Modal
                    isOpen={isInviteOpen}
                    onClose={onInviteClose}
                    isCentered
                >
                    <ModalOverlay />
	            <ModalContent>
                        <ModalHeader>Invite user to project</ModalHeader>
                        <ModalCloseButton />

                        <ModalBody>
                            <FormControl>
                                <FormLabel>User Email</FormLabel>
                                <Input placeholder="Email" onChange={event => setEmail(event.currentTarget.value)}/>
                            </FormControl>


                            <FormControl mt={4}>
                                <Checkbox onChange={event => setManager(event.currentTarget.checked)}>Manager</Checkbox>
                            </FormControl>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} type="submit" onClick={handleInvites}>
                                Save
                            </Button>
                            <Button onClick={onInviteClose}>Cancel</Button>
                        </ModalFooter>

                    </ModalContent>
                </Modal>	




            </div>
    );
    }

    return <Loading />
  }
  
