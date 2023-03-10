'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { useRouter } from "next/navigation";
import styles from './page.module.css'
import { Divider, Button, Box, useDisclosure, Heading, Text, Flex, useToast, Spacer, Card, CardBody, CardFooter, CardHeader, SimpleGrid, Center, StackDivider, Progress, Link, Select } from '@chakra-ui/react'
import Loading from "@/components/loading";

import { FaRegFlushed, FaRegGrinBeam, FaRegFrown, FaRegMeh } from 'react-icons/fa';
import { ArrowBackIcon, ExternalLinkIcon} from '@chakra-ui/icons'


import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'


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

import { Checkbox, CheckboxGroup, Stack } from '@chakra-ui/react';

import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
  } from '@chakra-ui/react'

  import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,
  } from '@chakra-ui/react'
import Navbar from "@/components/Nav";


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

    const [needMorale, setNeedMorale] = useState(false);
    const [morale, setMorale] = useState(0);
    const { isOpen: isMoraleOpen, onOpen: onMoraleOpen, onClose: onMoraleClose } = useDisclosure();

    const [allMorales, setAllMorales] = useState({AvgDayMorale: 0, AvgWeekMorale: 0, DayMorale: []});

    const [team, setTeam] = useState<any[]>([]);
    const { isOpen: isTeamOpen, onOpen: onTeamOpen, onClose: onTeamClose } = useDisclosure();

    const [email, setEmail] = useState("");
    const [manager, setManager] = useState(false);
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();

    const toast = useToast();
    const [hasChanged, setHasChanged] = useState(true);

    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [projectName, setProjectName] = useState("");
    const [deadline, setDeadline] = useState("");
    const [budget, setBudget] = useState(0);
    const [repository, setRepository] = useState("");


    const { isOpen: isTaskFormOpen, onOpen: onTaskFormOpen, onClose: onTaskFormClose } = useDisclosure();
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDeadline, setTaskDeadline] = useState("");
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [currentTask, setCurrentTask] = useState({id : -1, name : "", description : "", deadline : ""});
    const [currentTaskUsers, setCurrentTaskUsers] = useState<number[]>([]);

    const [githubRepos, setGithubRepos] = useState([""]);
	

    const { isOpen: isTaskOpen, onOpen: onTaskOpen, onClose: onTaskClose } = useDisclosure();

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
		    // Get project details
                    const endpoint = "/api/project/getProject";

                    const options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({userid: data?.user.id, projectid: projectid}),
                    };

                    const response = await fetch(endpoint, options);

                    // Get all morale details

                    const endpointMorale = "/api/project/getMorales";

                    const optionsMorale = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({projectid: projectid}),
                    };

                    const moraleResponse = await fetch(endpointMorale, optionsMorale);


                    
			

		    // Get all project tasks
		    const endpointTask = "/api/project/getAllTasks";

		    const optionsTask = {
			method: 'POST',
			headers: {
			    'Content-Type': 'application/json',
			},
			body: JSON.stringify({projectid: projectid}),
		    };

		    const taskRes = await fetch(endpointTask, optionsTask);


			// Get all project developers
			const endpointDev="/api/project/getAllDevelopers";

			const optionsDev = {
			    method: 'POST',

			    headers: {
				'Content-Type': 'application/json',
			    },
			    
		 	    body: JSON.stringify({project: projectid}),
			};

			const devRes = await fetch(endpointDev, optionsDev);

                    if(response.status === 200 && taskRes.status === 200 && devRes.status === 200){
                        const json = await response.json();
                        setProject(json);
                        setProjectName(json.name);
                        setDeadline(json.deadline);
                        setBudget(json.budget);
                        setRepository(json.repository_link);
                        
                        // console.log(json);	

                        const taskJson = await taskRes.json();
                        setAllTasks(taskJson);
                        //console.log(taskJson);

                        const devJson = await devRes.json();
                        setTeam(devJson);
                        //console.log(devJson);

                        const moraleJson = await moraleResponse.json();
                        // console.log("Morale object:")
                        // console.log(moraleJson);
                        setAllMorales(moraleJson);

                        setNeedMorale(!json.morale);
                        setLoaded(true);
                        
			            //console.log(json.morale);
                    }else{
                        router.push("/dashboard");
                    }
                };

                fetchData().catch(console.error);
        
            }
        }

    }, [status, hasChanged]);

    const queryUsername = async (username: string) => {
        return Promise.resolve(fetch(`https://api.github.com/users/${username}/repos`));
    }

    const submitMorale = async () => {
        const postData = {
            project: Number(project.id),
            u_id: Number(data?.user.id),
            morale: Number(morale),
        }

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/addMorale";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };
        const response = await fetch(endpoint, options);

	    const responseJSON = await response.json();
        setHasChanged(!hasChanged);

        console.log(response);

        onMoraleClose();
        setNeedMorale(false);
        toast({
            title: 'Morale submitted!',
            description: 'Your morale has been submitted.',
            status: "success",
            isClosable: true,

        });

    }
    const handleShowTeam = async () => {
        onTeamOpen();

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

    const labelStyles = {
        mt: '3',
        ml: '-2.5',
        fontSize: '2xl',
      }

      const resetEdit = () => {
        setProjectName(project.name);
        setDeadline(project.deadline);
        setBudget(project.budget);
        setRepository(project.repository_link);

        onEditClose();
      }


    const handleEdit = async () => {
	
        const postData = {
	    project: project.id,
	    name: projectName,
	    deadline: deadline,
	    budget: budget,
	    repository_link: repository
        };

        console.log(postData);

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

        setProject(prevState => ({
            ...prevState,
            name: projectName,
            deadline: deadline,
            budget: budget,
            repository_link: repository,
        }));

        onEditClose();

	
    }

    const dateStr = (date: string) => {
        var d = new Date(date);
        return d.toDateString();
    }

    const getProgress = () => {
        var start = new Date(project.start_date).valueOf();
        var end = new Date(project.deadline).valueOf();
        var today = new Date().valueOf();

        return(Math.round(((today - start) / (end - start)) * 100));
    }


    const handleNewTask = async () => {
	
        const postData = {
	    project: project.id,
	    name: taskName,
	    description: taskDescription,
	    deadline: taskDeadline,
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/addTask";

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
	onTaskFormClose();
	
    }


    const handleShowTask = async (task:any) => {
        setCurrentTask(task)
	onTaskOpen();
	
        const postData = {
		taskid: task.id,
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/getTaskUsers";

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
	setCurrentTaskUsers(responseJSON.map((a: any) => a.id));
    }

    const handleUserTaskAssignment = async () => {
	console.log(currentTask);
	
        const postData = {
		task: currentTask.id,
		userArr: currentTaskUsers
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/assignTaskToUser";

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
	
	onTaskClose();
    }

    const handleSelectUserForTask  = (event:any) => {
	    let value = Number(event.target.value);
	    if (currentTaskUsers.includes(value)) {
		    setCurrentTaskUsers(currentTaskUsers.filter((v) => v !== value));
	    } else {
		    setCurrentTaskUsers([...currentTaskUsers, value]);
	    }		
    }

    if (status === "authenticated" && loaded){
    return(
        
        <>
        
        <Flex direction='column' maxWidth="100vw" minHeight="100vh" align="center">
            <Navbar />
            <Box textAlign="center" mt={20} maxWidth="100vw">
                    <Flex alignItems="center" justifyContent="center">
                        <Button ml={3} position="fixed" left="0" colorScheme="teal" onClick={() => router.push("/dashboard")}>< ArrowBackIcon /></Button>
                        <Heading as='h1' size="2xl">{project.name}</Heading>
                    </Flex>
                    <Flex mt={2} justifyContent="center">
                        <Text as="b">Started: &nbsp;</Text>
                        <Text color="black">{dateStr(project.start_date)}</Text>
                    </Flex>
                    <Flex justifyContent="center">
                        <Text as="b">Deadline: &nbsp;</Text>
                        <Text color="black">{dateStr(project.deadline)}</Text>
                    </Flex>
                    <Flex justifyContent="center" direction="column" mt={2}>
                        <Text as="b">Progress:</Text>
                    <Progress mb={1} mt={1} hasStripe size='sm' value={Math.round((((new Date().valueOf()) - new Date(project.start_date).valueOf()) / ((new Date(project.deadline).valueOf()) - (new Date(project.start_date).valueOf()))) * 100)} />
                    <Flex justifyContent="center" mb={2}>
                        {
                            (new Date() > new Date(project.deadline)) ? <Text as="b" color="red">Deadline passed by {Math.floor((new Date().valueOf() - new Date(project.deadline).valueOf()) / (1000 * 3600 * 24))} days</Text> : 
                            <>
                                <Text as="b">Days Left: &nbsp;</Text>
                                <Text color="black">{Math.floor((new Date(project.deadline).valueOf() - new Date().valueOf()) / (1000 * 3600 * 24))}</Text>
                            </>
                        }                        
                    </Flex>
                    </Flex>
                </Box>
            <List spacing={3}>
            {allTasks.map((e, i) => (
                <ListItem key={i}><Button onClick={() => handleShowTask(e)}>{e.name}</Button></ListItem>
            ))}
		    </List>
            {  project.isManager ? (
        <div>
            <Button onClick={onTaskFormOpen} mt={5}>Add Task</Button>
            <Button onClick={handleShowTeam} mt={5}>Show Team Members</Button>
            <Button onClick={onEditOpen} mt={5}>Edit Project</Button>
            <Box borderRadius={4} mt={2}>

                <Slider value={allMorales.AvgWeekMorale} min={0} max={6} step={1} mb={10} aria-label='Week Morale'>
                            <SliderMark value={0} {...labelStyles}>
                                < FaRegFlushed />
                            </SliderMark>

                            <SliderMark value={3} {...labelStyles}>
                                < FaRegMeh />
                            </SliderMark>

                            <SliderMark value={6} {...labelStyles}>
                                < FaRegGrinBeam />
                            </SliderMark>
                                <SliderTrack bg='grey'>
                                    <Box position="relative" right={10} />
                                    <SliderFilledTrack bg='tomato' />
                                </SliderTrack>
                                
                            </Slider>
            </Box>
        </div>) : "Not manager" }

        <Tabs variant='enclosed' width="100%">
            <TabList>
                <Tab>Overview</Tab>
                <Tab>Team</Tab>
                <Tab>Tasks</Tab>
            </TabList>

            <TabPanels>
                <TabPanel>
                <Card>
            <CardHeader>
            <Heading size='md'>Project Details</Heading>
            </CardHeader>
            <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Project Specification
                        </Heading>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Project Name: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            {project.name}
                        </Text>
                        </Flex>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Project Category: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            {project.budget}
                        </Text>
                        </Flex>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Budget: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            £{project.budget}
                        </Text>
                        </Flex>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Start Date: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            {new Date(project.start_date).toDateString()}
                        </Text>
                        </Flex>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Deadline: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            {new Date(project.deadline).toDateString()}
                        </Text>
                        </Flex>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Days Left: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            {new Date() > new Date(project.deadline) ? "Deadline passed" : Math.floor((new Date(project.deadline).valueOf() - new Date().valueOf()) / (1000 * 3600 * 24))}
                        </Text>
                        </Flex>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Codebase: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            {project.repository_link ? <Link href={project.repository_link} isExternal>Link <ExternalLinkIcon mx='2px' /></Link> : <Text as='i'>None</Text>}
                        </Text>
                        </Flex>
                        { project.isManager && <Button onClick={onEditOpen} mt={4}>Edit Project</Button>}
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Overview
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            Check out the overview of your clients.
                        </Text>
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Analysis
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            See a detailed analysis of all your business clients.
                        </Text>
                    </Box>
                </Stack>
            </CardBody>
        </Card>
                </TabPanel>
                <TabPanel>
                <Card>
            <CardHeader>
            <Heading size='md'> Customer dashboard</Heading>
            </CardHeader>
            <CardBody>
            <Text>View a summary of all your customers over the last month.</Text>
            </CardBody>
            <CardFooter>
            <Button>View here</Button>
            </CardFooter>
        </Card>
                </TabPanel>
                <TabPanel>
                <Card>
            <CardHeader>
            <Heading size='md'> Customer dashboard</Heading>
            </CardHeader>
            <CardBody>
            <Text>View a summary of all your customers over the last month.</Text>
            </CardBody>
            <CardFooter>
            <Button>View here</Button>
            </CardFooter>
        </Card>
                </TabPanel>
            </TabPanels>
        </Tabs>

        {/* <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(100vw, 100fr))'>
        <Card>
            <CardHeader>
            <Heading size='md'>Project Team</Heading>
            </CardHeader>
            <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Team Morale
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            View a summary of all your clients over the last month.
                        </Text>
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Overview
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            Check out the overview of your clients.
                        </Text>
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Analysis
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            See a detailed analysis of all your business clients.
                        </Text>
                    </Box>
                </Stack>
            </CardBody>
        </Card>

        <Card>
            <CardHeader>
            <Heading size='md'> Customer dashboard</Heading>
            </CardHeader>
            <CardBody>
            <Text>View a summary of all your customers over the last month.</Text>
            </CardBody>
            <CardFooter>
            <Button>View here</Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
            <Heading size='md'> Customer dashboard</Heading>
            </CardHeader>
            <CardBody>
            <Text>View a summary of all your customers over the last month.</Text>
            </CardBody>
            <CardFooter>
            <Button>View here</Button>
            </CardFooter>
        </Card>
        </SimpleGrid> */}
        </Flex>
        
        


        



        <Modal
                    isOpen={isTaskOpen}
                    onClose={onTaskClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{currentTask.name}</ModalHeader>
                        <ModalCloseButton />


                        <ModalBody pb={6}>
	    			{currentTask.description} 
	    			{currentTask.deadline}
	    			Assign Task
	    				<CheckboxGroup value={currentTaskUsers}>
				<Stack spacing={5} direction='column'>
					    {team.map((e, i) => (
						    <Checkbox isDisabled={!project.isManager} defaultChecked={currentTaskUsers.includes(e.id)} key={i} value={e.id} onChange={handleSelectUserForTask}>{e.forename} {e.surname}</Checkbox>
					    ))}
	    			</Stack>
	    				</CheckboxGroup>

                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={project.isManager ? handleUserTaskAssignment : onTaskClose}>Done</Button>
                        </ModalFooter>

                    </ModalContent>
	    </Modal>

                <Modal
                    isOpen={isTaskFormOpen}
                    onClose={onTaskFormClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Add Task</ModalHeader>
                        <ModalCloseButton />


                        <ModalBody pb={6}>
                            <FormControl mt={4}>
                                <FormLabel>Name</FormLabel>
                                <Input placeholder="Task Name" onChange={event => setTaskName(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Description</FormLabel>
                                <Input placeholder="Description of task" onChange={event => setTaskDescription(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Deadline</FormLabel>
                                <Input placeholder="Deadline of task" type="date" onChange={event => setTaskDeadline(event.currentTarget.value)}/>
                            </FormControl>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} type="submit" onClick={handleNewTask}>
                                Save
                            </Button>
                            <Button onClick={onTaskFormClose}>Cancel</Button>
                        </ModalFooter>

                    </ModalContent>
	    </Modal>

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
                    onClose={resetEdit}
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
                                <Input defaultValue={new Date(project.deadline).toISOString().substring(0,10)} type="date" onChange={event => setDeadline(event.currentTarget.value)}/>
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
                            <Flex>
                            <FormControl mt={4} width="45%">
                                <FormLabel>Username</FormLabel>
                                <Input defaultValue={project.repository_link} onChange={event => queryUsername(event.currentTarget.value).then(response => response.json()).then(data => {
                                    setGithubRepos([""])
                                    for (let i in data) {
                                        setGithubRepos(oldArray => [...oldArray, data[i].name])
                                    }
                                })}/>
                            </FormControl>
                            <Spacer />
                            <FormControl mt={4} width="45%">
                                <FormLabel>Repository</FormLabel>
                                <Select placeholder="Select repository">
                                    {githubRepos.map((e, i) => ( <option key={i} value={e}>{e}</option> ))}
                                </Select>
                            </FormControl>
                            </Flex>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} type="submit" onClick={handleEdit}>
                                Save
                            </Button>
                            <Button onClick={resetEdit}>Cancel</Button>
                        </ModalFooter>

                    </ModalContent>
	    </Modal>

        <Modal
                    isOpen={needMorale}
                    onClose={onMoraleClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Morale Check-in</ModalHeader>

                        <ModalBody pb={6}>
                            <Slider defaultValue={3} min={0} max={6} step={1} aria-label='morale slider' onChangeEnd={(val) => setMorale(val)}>
                            <SliderMark value={0} {...labelStyles}>
                                < FaRegFlushed />
                            </SliderMark>

                            <SliderMark value={3} {...labelStyles}>
                                < FaRegMeh />
                            </SliderMark>

                            <SliderMark value={6} {...labelStyles}>
                                < FaRegGrinBeam />
                            </SliderMark>
                                <SliderTrack bg='teal'>
                                    <Box position="relative" right={10} />
                                    <SliderFilledTrack bg='tomato' />
                                </SliderTrack>
                                <SliderThumb boxSize={3} bg="tomato" />
                            </Slider>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' type="submit" onClick={submitMorale}>
                                Check in
                            </Button>
                        </ModalFooter>

                    </ModalContent>
	    </Modal>
        </>
        /*
        <div className={styles.container}>
                <h1>Welcome! You are signed in and can access this page.</h1>
                <h2>{JSON.stringify(data.user, null, 2)}</h2>

                <Divider />

                <Heading as='h1' size='2xl'>{project.name}</Heading>

                <Text>{project.start_date.substring(0, 10)}</Text>

		    <List spacing={3}>
			    {allTasks.map((e, i) => (
				    <ListItem key={i}><Button onClick={() => handleShowTask(e)}>{e.name}</Button></ListItem>
			    ))}
		    </List>
		{  project.isManager ? (
        <div>
            <Button onClick={onTaskFormOpen} mt={5}>Add Task</Button>
            <Button onClick={handleShowTeam} mt={5}>Show Team Members</Button>
            <Button onClick={onEditOpen} mt={5}>Edit Project</Button>
            <Box bg="white" width="20%" borderRadius={4} mt={2}>
                <Stat>
                    <StatLabel>Team Morale</StatLabel>
                    <StatNumber>{allMorales.AvgDayMorale}</StatNumber>
                    <StatHelpText>
                        <StatArrow type={allMorales.AvgDayMorale >= allMorales.AvgWeekMorale ? 'increase' : 'decrease'} />
                        {Math.abs((allMorales.AvgDayMorale - allMorales.AvgWeekMorale)) / allMorales.AvgWeekMorale * 100}%
                    </StatHelpText>
                </Stat>
            </Box>

            <Slider defaultValue={allMorales.AvgWeekMorale} min={0} max={6} step={1} aria-label='Week Morale' isDisabled>
                            <SliderMark value={0} {...labelStyles}>
                                < FaRegFlushed />
                            </SliderMark>

                            <SliderMark value={3} {...labelStyles}>
                                < FaRegMeh />
                            </SliderMark>

                            <SliderMark value={6} {...labelStyles}>
                                < FaRegGrinBeam />
                            </SliderMark>
                                    <SliderFilledTrack bg='tomato' />
                                <SliderTrack bg='teal'>
                                    <Box position="relative" right={10} />
                                </SliderTrack>
                                <SliderThumb boxSize={3} bg="tomato" />
                            </Slider>
        </div>) : "Not manager" }

                <Modal
                    isOpen={isTaskOpen}
                    onClose={onTaskClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{currentTask.name}</ModalHeader>
                        <ModalCloseButton />


                        <ModalBody pb={6}>
	    			{currentTask.description} 
	    			{currentTask.deadline}
	    			<br />
	    			Assign Task
				<Stack spacing={5} direction='column'>
					    {team.map((e, i) => (
						    <Checkbox defaultChecked={currentTaskUsers.includes(e.id)} key={i}>{e.forename} {e.surname}</Checkbox>
					    ))}
	    			</Stack>

                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={onTaskClose}>Done</Button>
                        </ModalFooter>

                    </ModalContent>
	    </Modal>

                <Modal
                    isOpen={isTaskFormOpen}
                    onClose={onTaskFormClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Add Task</ModalHeader>
                        <ModalCloseButton />


                        <ModalBody pb={6}>
                            <FormControl mt={4}>
                                <FormLabel>Name</FormLabel>
                                <Input placeholder="Task Name" onChange={event => setTaskName(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Description</FormLabel>
                                <Input placeholder="Description of task" onChange={event => setTaskDescription(event.currentTarget.value)}/>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Deadline</FormLabel>
                                <Input placeholder="Deadline of task" type="date" onChange={event => setTaskDeadline(event.currentTarget.value)}/>
                            </FormControl>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} type="submit" onClick={handleNewTask}>
                                Save
                            </Button>
                            <Button onClick={onTaskFormClose}>Cancel</Button>
                        </ModalFooter>

                    </ModalContent>
	    </Modal>

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

        <Modal
                    isOpen={needMorale}
                    onClose={onMoraleClose}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Morale Check-in</ModalHeader>

                        <ModalBody pb={6}>
                            <Slider defaultValue={3} min={0} max={6} step={1} aria-label='morale slider' onChangeEnd={(val) => setMorale(val)}>
                            <SliderMark value={0} {...labelStyles}>
                                < FaRegFlushed />
                            </SliderMark>

                            <SliderMark value={3} {...labelStyles}>
                                < FaRegMeh />
                            </SliderMark>

                            <SliderMark value={6} {...labelStyles}>
                                < FaRegGrinBeam />
                            </SliderMark>
                                <SliderTrack bg='teal'>
                                    <Box position="relative" right={10} />
                                    <SliderFilledTrack bg='tomato' />
                                </SliderTrack>
                                <SliderThumb boxSize={3} bg="tomato" />
                            </Slider>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' type="submit" onClick={submitMorale}>
                                Check in
                            </Button>
                        </ModalFooter>

                    </ModalContent>
	    </Modal>
            </div>
            */
    );
    }

    return <Loading />
  }
  
