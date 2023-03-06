'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import styles from './page.module.css'
import { Divider, Button, Box, useDisclosure } from '@chakra-ui/react'
import { useRouter } from "next/navigation";

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

import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from '@chakra-ui/react'
import Loading from "@/components/loading";

export default function Dashboard() {
    const router = useRouter();
    const {status, data} = useSession();
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
    const { isOpen: isProjectOpen, onOpen: onProjectOpen, onClose: onProjectClose } = useDisclosure();
    
    const [loading, setLoading] = useState(false);
    const [invites, setInvites] = useState([]);
    
    const [projects, setProjects] = useState<any[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

    const [newProject, setNewProject] = useState({});
    const [projectName, setProjectName] = useState("");
    const [deadline, setDeadline] = useState("");
    const [budget, setBudget] = useState("");
    const [repository, setRepository] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") redirect("/login");

        if (status === "authenticated") {
            setProjectsLoading(true);
            const endpoint = "/api/user/getAllProjects";

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userid: data?.user.id}),
            };

            fetch(endpoint, options)
            .then((response) => response.json())
            .then((responseJSON) => {
                setProjects(responseJSON);
                setProjectsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
        }

    }, [status]);

    
    const handleInvites = async () => {
        setLoading(true);
        onInviteOpen();

        const postData = {
            userid: data?.user.id,
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

        const responseJSON = await response.json();

        setInvites(responseJSON);

        setLoading(false);        

    }



    const handleNewProject = async () => {
        setLoading(true);
        

        const postData = {
		u_id: data?.user.id,
		name: projectName,
		deadline: new Date(deadline),
		budget: Number(budget),
		repository_link: repository
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/createNewProject";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };
        const response = await fetch(endpoint, options);

        const responseJSON = await response.json();

        if(response.status == 201){
            router.push("/projects/" + responseJSON.name.replace(/\s+/g, '-').toLowerCase() + "-" + responseJSON.id); 
        }

        setLoading(false);
        onProjectClose();
    }

    if (status === "authenticated"){

        const displayInvites = () => {

            if(invites.length){
                const inviteList = invites.map((invite) => {
                    return (
                        <div>
                            <h3>Invite Name</h3>
                        </div>
                    )
                });
    
                return inviteList;    
            }else{
                return <h3>You have no invites</h3>
            }

        }

        return (
            <div className={styles.container}>
                <h1>Welcome! You are signed in and can access this page.</h1>
                <h2>{JSON.stringify(data.user, null, 2)}</h2>

                <Divider />

                <Button onClick={handleInvites} mt={5}>See Project Invites</Button>

                <Button onClick={onProjectOpen} mt={5}>Create new Project</Button>

                <Box bg='tomato' w='20%' h='fit' mt={5} color='white' display='flex' justifyContent='center' alignItems='center'>
                    {projectsLoading ? "Loading..." : projects.length == 0 ? "You have no projects" :
			    <List spacing={3}>
				    {projects.map((e, i) => (
					    <ListItem key={i}>{e.name}</ListItem>
				    ))}
			    </List>
		    }
                </Box>

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
                            {loading ? "Loading..." : displayInvites()}
                            
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
                            <FormControl mt={4}>
                                <FormLabel>Project Name</FormLabel>
                                <Input placeholder="Project Name" onChange={event => setProjectName(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Deadline</FormLabel>
                                <Input placeholder="Select date" type="date" onChange={event => setDeadline(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Budget</FormLabel>

                                <InputGroup>
                                    <InputLeftElement
                                    pointerEvents='none'
                                    color='gray.300'
                                    fontSize='1.2em'
                                    children='£'
                                    />
                                    <Input type="number" placeholder='Enter amount' onChange={event => setBudget(event.currentTarget.value)}/>

                                </InputGroup>
                                
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Repository Link</FormLabel>
                                <Input placeholder="https://" onChange={event => setRepository(event.currentTarget.value)}/>
                            </FormControl>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} type="submit" onClick={handleNewProject}>
                                Save
                            </Button>
                            <Button onClick={onProjectClose}>Cancel</Button>
                        </ModalFooter>

                    </ModalContent>
                </Modal>


            </div>
        );
    }

    return <Loading />
}
