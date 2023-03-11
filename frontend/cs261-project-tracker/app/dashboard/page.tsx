'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import styles from './page.module.css'
import { Select, Divider, Button, Box, useDisclosure, Flex, Heading, Spacer, Container, CircularProgress, Grid, GridItem, Switch } from '@chakra-ui/react'
import { useRouter } from "next/navigation";
import Navbar from "@/components/Nav";
import { CheckIcon, CloseIcon } from '@chakra-ui/icons'
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
import Link from "next/link";

import { Select as ReactSelect } from "chakra-react-select";
import { categories } from "@/data/data";


export default function Dashboard() {
    const router = useRouter();
    const {status, data} = useSession();
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
    const { isOpen: isProjectOpen, onOpen: onProjectOpen, onClose: onProjectClose } = useDisclosure();
    
    const [loading, setLoading] = useState(false);
    const [invites, setInvites] = useState<any[]>([]);
    
    const [projects, setProjects] = useState<any[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

    const [testChange, setTestChange] = useState(true);

    const [newProject, setNewProject] = useState({});
    const [projectName, setProjectName] = useState("");
    const [projectCategory, setProjectCategory] = useState("");
    const [deadline, setDeadline] = useState("");
    const [budget, setBudget] = useState("");
    const [repository, setRepository] = useState("");
    const [projectCategories, setProjectCategories] = useState([""]);

    const [switchToggle, setSwitchToggle] = useState(true);
    const [username, setUsername] = useState("");
    const [repo, setRepo] = useState("");
    const [githubRepos, setGithubRepos] = useState([""]);

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


    }, [status, testChange]);

    const queryUsername = async (username: string) => {
        return Promise.resolve(fetch(`https://api.github.com/users/${username}/repos`));
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            queryUsername(username).then(response => response.json()).then(data => {
                setGithubRepos([""])
                for (let i in data) {
                    setGithubRepos(oldArray => [...oldArray, data[i].name])
                }
            })
        }, 1000)

        return () => clearTimeout(delayDebounceFn)
    }, [username])

    
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

    const respondInvite = async (projectid: Number, action: boolean) => {

        const postData = {
            project: projectid,
            u_id: data?.user.id,
            accept: action
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/user/handleInvite";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };
        const response = await fetch(endpoint, options);

        setInvites(invites.filter(item => item.id !== projectid));


        if(action){
            setTestChange(!testChange);
        }

    }

    const handleNewProject = async () => {
        setLoading(true);
        

        const postData = {
		u_id: data?.user.id,
		name: projectName,
		deadline: new Date(deadline),
		budget: Number(budget),
		repository_link: "",
        categories: projectCategories,
        };

        if(switchToggle){
            if(username === "" || repo === ""){
                postData.repository_link = ""
            } else{
                postData.repository_link = `https://www.github.com/${username}/${repo}`;
            }
        } else{
            postData.repository_link = repository;
        }

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
                return(
                    <List spacing={3} display="flex" flexDirection="column" alignItems="center">
                        {invites.map((e, i) => (

                            <Flex width="100%" key={i} align="center">
                                <ListItem key={i} maxWidth="60%">{e.name}</ListItem>
                                <Spacer />
                                <Flex gap={1}>
                                    <Button key={i + "accept"} onClick={() => {
                                        respondInvite(e.id, true);
                                        }}><CheckIcon /></Button>
                                    <Button key={i + "decline"} onClick={() => respondInvite(e.id, false)}><CloseIcon /></Button>
                                </Flex>
                            </Flex>

                        ))}
                    </List>
                );
            }else{
                return <h2>You have no invites</h2>
            }

        }

        return (

            <>
            <Flex direction='column' width="100vw" minHeight="100vh" align="center">
                <Navbar name={data?.user.name}/>
                <Box textAlign="center" mt={20}>
                    <Heading as='h1' size="2xl">Dashboard</Heading>
                    <Heading as='h2' size='md' mt={2}>Welcome, {data?.user?.name?.slice(0, data.user.name?.lastIndexOf(" "))}!</Heading>
                </Box>
                <Flex gap="10px" justifyContent="center">
                    <Button onClick={handleInvites} mt={5}>See Project Invites</Button>
                    <Button onClick={onProjectOpen} mt={5}>Create new Project</Button>
                </Flex>
                <Flex mt={6} direction="column">
                    <Heading as="h2" size="md">Current projects</Heading>
                    <Divider />
                    
                </Flex>
                <Box w="clamp(300px, 40%, 400px)" h='fit' mt={5} display='flex' justifyContent='center' alignItems='center'>
                    {projectsLoading ? <CircularProgress size='2rem' isIndeterminate color='green.300' /> : projects.length == 0 ? "You have no projects" :
			    <List spacing={3} display="flex" flexDirection="column" alignItems="center">
				    {projects.filter((proj) => proj.end_date === null).map((e, i) => (
					    <ListItem key={i}><Button onClick={() => router.push("/projects/" + e.name.replace(/\s+/g, '-').toLowerCase() + "-" + e.id)}>{e.name}</Button></ListItem>
				    ))}
			    </List>
		    }
                </Box>
                {projects.filter((proj) => proj.end_date !== null).length > 0 && 
                <>
                <Flex mt={6} direction="column">
                    <Heading as="h2" size="md">Past projects</Heading>
                    <Divider />
                    
                </Flex>
                <Box w="clamp(300px, 40%, 400px)" h='fit' mt={5} display='flex' justifyContent='center' alignItems='center'>
                    {projectsLoading ? <CircularProgress size='2rem' isIndeterminate color='green.300' /> : projects.length == 0 ? "You have no projects" :
			    <List spacing={3} display="flex" flexDirection="column" alignItems="center">
				    {projects.filter((proj) => proj.end_date !== null).map((e, i) => (
					    <ListItem key={i}><Button colorScheme={e.status === 1 ? 'green' : 'red'} onClick={() => router.push("/projects/" + e.name.replace(/\s+/g, '-').toLowerCase() + "-" + e.id)}>{e.name}</Button></ListItem>
				    ))}
			    </List>
		    }
                </Box>
                </>
                }


            </Flex>

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
                            <Button colorScheme='teal' onClick={onInviteClose}>Close</Button>
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
                        <form>
                            <FormControl mt={4} isRequired>
                                <FormLabel>Project Name</FormLabel>
                                <Input placeholder="Project Name" onChange={event => setProjectName(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4} isRequired>
                                <FormLabel>Project Category</FormLabel>
                                <ReactSelect
        isMulti
        options={categories}
        placeholder="Select some colors..."
        closeMenuOnSelect={false}
        selectedOptionColor="green"
        hideSelectedOptions={false}
        onChange={(e) => {setProjectCategories(e.map((e2) => e2.value))
        }}
      />
{/*                                 <Select placeholder="Select Option" onChange={event => setProjectCategory(event.currentTarget.value)}>
                                    <option value="1">Transaction Processing System</option>
                                    <option value="2">Management Information System</option>
                                    <option value="3">Enterprise System</option>
                                    <option value="4">Safety Critical System</option>
                                </Select> */}
                            </FormControl>

                            <FormControl mt={4} isRequired>
                                <FormLabel>Deadline</FormLabel>
                                <Input placeholder="Select date" type="date" onChange={event => setDeadline(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4} isRequired>
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
                            <Divider mt={3}/> 
                            <FormControl mt={4} display='flex' alignItems='center'>
                                <FormLabel mb='0'>GitHub Repository?</FormLabel>
                                <Switch onChange={() => setSwitchToggle(!switchToggle)} defaultChecked={switchToggle} colorScheme="green" sx={{ 'span.chakra-switch__track:not([data-checked])': { backgroundColor: 'tomato' } }}/>
                            </FormControl>

                            {switchToggle ? 
                            <Flex>
                            <FormControl mt={4} width="45%">
                                <FormLabel>Username</FormLabel>
                                <Input placeholder="Search for user" onChange={(e) => setUsername(e.currentTarget.value)} />
                            </FormControl>
                            <Spacer />
                            <FormControl mt={4} width="45%">
                                <FormLabel>Repository</FormLabel>
                                <Select placeholder="Select repository" onChange={(e) => setRepo(e.currentTarget.value)}>
                                    {githubRepos.map((e, i) => ( <option key={i} value={e}>{e}</option> ))}
                                </Select>
                            </FormControl>
                            </Flex> :
                         <FormControl mt={4}>
                            <FormLabel>Repository Link</FormLabel>
                            <Input onChange={event => setRepository(event.currentTarget.value)}/>
                         </FormControl>   
                            }
                            </form>

                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='teal' mr={3} type="submit" onClick={handleNewProject}>
                            Create
                        </Button>
                        <Button onClick={onProjectClose}>Cancel</Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>

            </>
            

            /*
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
					    <Link key={i} href={"/projects/" + e.name.replace(/\s+/g, '-').toLowerCase() + "-" + e.id}><ListItem key={i}>{e.name}</ListItem></Link>
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
		<a href="/login" onClick={() => signOut()} className="btn-signin">Sign out</a>

            </div>
            */
            
        );
        
    }

    return <Loading />
}
