'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import styles from './page.module.css'
import { Divider, Button, Box, useDisclosure } from '@chakra-ui/react'

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'

export default function Dashboard() {
    const {status, data} = useSession();
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
    const { isOpen: isProjectOpen, onOpen: onProjectOpen, onClose: onProjectClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (status === "unauthenticated") redirect("/login");
    }, [status]);


    
    const handleInvites = async () => {
        setLoading(true);
        onInviteOpen();
        const postData = {
            id: data?.user.id,
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/user/getInvitedProjects";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };
        const response = await fetch(endpoint, options);

        console.log(response);


        

    }

    if (status === "authenticated"){
        return (
            <div className={styles.container}>
                <h1>Welcome! You are signed in and can access this page.</h1>
                <h2>{JSON.stringify(data.user, null, 2)}</h2>

                <Divider />

                <Button onClick={handleInvites} mt={5}>See Project Invites</Button>

                <Button onClick={onProjectOpen} mt={5}>Create new Project</Button>

                <Box bg='tomato' w='20%' h='100px' mt={5} color='white' display='flex' justifyContent='center' alignItems='center'>sdf</Box>

                <Modal
                    isOpen={isInviteOpen}
                    onClose={onInviteClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Project Invites</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            Hello!
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3}>
                                Save
                            </Button>
                            <Button onClick={onInviteClose}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <Modal
                    isOpen={isProjectOpen}
                    onClose={onProjectClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create a new project</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            Hello!
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3}>
                                Save
                            </Button>
                            <Button onClick={onProjectClose}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>


            </div>
        );
    }

    return <div>Loading...</div>
}