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

import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
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
    const [project, setProject] = useState({id : -1, name : "", start_date : "", isManager : false, budget: -1, deadline : "", repository_link : ""});
    const [loaded, setLoaded] = useState(false);

    const [team, setTeam] = useState<any[]>([]);
    const { isOpen: isTeamOpen, onOpen: onTeamOpen, onClose: onTeamClose } = useDisclosure();

    const [email, setEmail] = useState("");
    const [manager, setManager] = useState(false);
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();

    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [projectName, setProjectName] = useState("");
    const [deadline, setDeadline] = useState("");
    const [budget, setBudget] = useState(0);
    const [repository, setRepository] = useState("");

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
			console.log(json);
                    }else{
                        router.push("/dashboard");
                    }
                };

                fetchData().catch(console.error);
        
            }
        }

    }, [status]);


    const handleShowTeam = async () => {
        onTeamOpen();

        const postData = {
	    project: project.id,
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/getAllDevelopers";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };
        const response = await fetch(endpoint, options);

	const responseJSON = await response.json();
	setTeam(responseJSON);
    }


    const handleInvites = async () => {

        const postData = {
	    project: project.id,
            email: email,
	    ismanager: manager,
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


    const handleEdit = async () => {
	
        const postData = {
	    project: project.id,
	    name: projectName,
	    deadline: deadline,
	    budget: budget,
	    repository_link: repository
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/editProject";

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
	
    }

    if (status === "authenticated" && loaded){
    return(
        <div className={styles.container}>
                <h1>Welcome! You are signed in and can access this page.</h1>
                <h2>{JSON.stringify(data.user, null, 2)}</h2>

                <Divider />

                <Heading as='h1' size='2xl'>{project.name}</Heading>

                <Text>{project.start_date.substring(0, 10)}</Text>

		{ loaded ? ( project.isManager ? <div><Button onClick={handleShowTeam} mt={5}>Show Team Members</Button> <Button onClick={onEditOpen} mt={5}>Edit Project</Button></div> : "Not manager") : "Loading..."}


	        <Modal
                    isOpen={isTeamOpen}
                    onClose={onTeamClose}
                    isCentered
                >
                    <ModalOverlay />
	            <ModalContent>
                        <ModalHeader>Team Members List</ModalHeader>
                        <ModalCloseButton />

                        <ModalBody>
			    <List spacing={3}>
				    {team.map((e, i) => (
					    <ListItem key={i}>{e.forename} {e.surname}</ListItem>
				    ))}
			    </List>
                        </ModalBody>
	
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

                    </ModalContent>
                </Modal>
                <Modal
                    isOpen={isEditOpen}
                    onClose={onEditClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Change project details</ModalHeader>
                        <ModalCloseButton />


                        <ModalBody pb={6}>
                            <FormControl mt={4}>
                                <FormLabel>Project Name</FormLabel>
                                <Input defaultValue={project.name} onChange={event => setProjectName(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Deadline</FormLabel>
                                <Input defaultValue={project.deadline.substring(0,10)} type="date" onChange={event => setDeadline(event.currentTarget.value)}/>
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
                                    <Input type="number" defaultValue={Number(project.budget)} onChange={event => setBudget(Number(event.currentTarget.value))}/>

                                </InputGroup>
                                
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Repository Link</FormLabel>
                                <Input defaultValue={project.repository_link} onChange={event => setRepository(event.currentTarget.value)}/>
                            </FormControl>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} type="submit" onClick={handleEdit}>
                                Save
                            </Button>
                            <Button onClick={onEditClose}>Cancel</Button>
                        </ModalFooter>

                    </ModalContent>
	    </Modal>
            </div>
    );
    }

    return <Loading />
  }
  
