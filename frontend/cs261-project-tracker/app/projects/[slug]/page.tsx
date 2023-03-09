'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { useRouter } from "next/navigation";
import styles from './page.module.css'
import { Divider, Button, Box, useDisclosure, Heading, Text, Flex, useToast, Spacer } from '@chakra-ui/react'
import Loading from "@/components/loading";

import { FaRegFlushed, FaRegGrinBeam, FaRegFrown, FaRegMeh } from 'react-icons/fa';
import { ArrowBackIcon} from '@chakra-ui/icons'

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
    const [currentTask, setCurrentTask] = useState({name : "", description : "", deadline : ""});
    const [currentTaskUsers, setCurrentTaskUsers] = useState<any[]>([]);
	

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
                        //console.log(json);	

                        const taskJson = await taskRes.json();
                        setAllTasks(taskJson);
                        //console.log(taskJson);

                        const devJson = await devRes.json();
                        setTeam(devJson);
                        //console.log(devJson);

                        const moraleJson = await moraleResponse.json();
                        console.log("Morale object:")
                        console.log(moraleJson);
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

    const dateStr = (date: string) => {
        var d = new Date(date);
        return d.toDateString();
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
    if (status === "authenticated" && loaded){
    return(
        <>
        <Flex direction='column' width="100vw" minHeight="100vh" align="center">
            <Navbar />
            <Box textAlign="center" mt={20} width="100%">
                    <Flex alignItems="center">
                        <Button ml={3} position="fixed" colorScheme="teal" onClick={() => router.push("/dashboard")}>< ArrowBackIcon /> &nbsp; Dashboard</Button>
                        <Spacer />
                        <Heading as='h1' size="2xl">{project.name}</Heading>
                        <Spacer />
                    </Flex>
                    <Flex mt={2} justifyContent="center">
                        <Text as="b">Started: &nbsp;</Text>
                        <Text color="black">{dateStr(project.start_date)}</Text>
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
                <Stat>
                    <StatLabel>Team Morale</StatLabel>
                    <StatNumber>{allMorales.AvgDayMorale}<Text as="sub" color="grey">/6</Text></StatNumber>
                    <StatHelpText>
                        <StatArrow type={allMorales.AvgDayMorale >= allMorales.AvgWeekMorale ? 'increase' : 'decrease'} />
                        {(Math.abs((allMorales.AvgDayMorale - allMorales.AvgWeekMorale)) / allMorales.AvgWeekMorale * 100).toFixed(2)}%
                    </StatHelpText>
                </Stat>

                <Slider value={allMorales.AvgWeekMorale} min={0} max={6} step={1} aria-label='Week Morale'>
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
  
