'use client';

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { useRouter } from "next/navigation";
import styles from './page.module.css'
import { Switch, Divider, Button, Box, useDisclosure, Heading, Text, Flex, useToast, Spacer, Card, CardBody, CardFooter, CardHeader, SimpleGrid, Center, StackDivider, Progress, Link, Select, Wrap, WrapItem, Tag, HStack } from '@chakra-ui/react'
import Loading from "@/components/loading";
import WarningMessage from "@/components/WarningMessage";
import ErrorMessage from "@/components/ErrorMessage";


import { FaRegFlushed, FaRegGrinBeam, FaRegFrown, FaRegMeh } from 'react-icons/fa';
import { ArrowBackIcon, ExternalLinkIcon} from '@chakra-ui/icons'


import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

import { Select as ReactSelect } from "chakra-react-select";
import { categories as categoryList } from "@/data/data";

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
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
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

import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react';

import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import React from "react";

export default function Page({
    params,
    searchParams,
  }: {
    params: { slug: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }) {

    const router = useRouter();
    const {status, data} = useSession();
    const [project, setProject] = useState({id : -1, name : "", start_date : "", isManager : false, budget: -1, deadline : "", repository_link : "", categories : [""], morale: -1});
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
    const [categories, setCategories] = useState([""]);


    const { isOpen: isTaskFormOpen, onOpen: onTaskFormOpen, onClose: onTaskFormClose } = useDisclosure();
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDeadline, setTaskDeadline] = useState("");
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [currentTask, setCurrentTask] = useState({id : -1, name : "", description : "", start_date : "",  deadline : ""});
    const [currentTaskUsers, setCurrentTaskUsers] = useState<number[]>([]);

    const [githubRepos, setGithubRepos] = useState([""]);
    const [username, setUsername] = useState("");
    const [repo, setRepo] = useState("");

    const [predictFunds, setPredictFunds] = useState({ funding_required : 0 });
    const [gain, setGain] = useState({ project_gain : 0, suggest_size : 0, suggest_duration : 0, suggest_gains : 0 });
    const [effort, setEffort] = useState({ effort_required : 0 });

    const [switchToggle, setSwitchToggle] = useState(false);

    const { isOpen: isDeleteProjectOpen, onOpen: onDeleteProjectOpen, onClose: onDeleteProjectClose } = useDisclosure();
    const { isOpen: isAbandonProjectOpen, onOpen: onAbandonProjectOpen, onClose: onAbandonProjectClose } = useDisclosure();
    const { isOpen: isCompleteProjectOpen, onOpen: onCompleteProjectOpen, onClose: onCompleteProjectClose } = useDisclosure();

    const [manageProjectConfirmation, setManageProjectConfirmation] = useState("");
    const cancelRef = useRef<HTMLButtonElement>(null);

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
                        setCategories(json.categories);
                        setSwitchToggle(json.repository_link === "");

                        

                        const taskJson = await taskRes.json();
                        setAllTasks(taskJson);


                        const devJson = await devRes.json();
                        setTeam(devJson);


                        const moraleJson = await moraleResponse.json();

                        setAllMorales(moraleJson);
                        
                        setNeedMorale(Number(json.morale) === -1 ? true : false);
                        setLoaded(true);
                        

                    }else{
                        router.push("/dashboard");
                    }
                };

                fetchData().catch(console.error);
        
            }
        }

    }, [status, hasChanged]);


    useEffect(() => {
	    async function fetchData() { 
		    // Get funding requirement prediction
                    const endpoint = "http://localhost:3001/api/predictFunding";
		    let data = project.categories.reduce((acc, item) => {
			    acc[item] = 1;
			    return acc;
		    }, {} as {[key: string]: number});

                    const options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
			    body: JSON.stringify(data),
                    };

                    const response = await fetch(endpoint, options);

		    // Get project profitability prediction
                    const endpointGain = "http://localhost:3001/api/predictGain";
		    const date1:Date = new Date(project.start_date);
		    const date2:Date = new Date(project.deadline);

		    const diffInMs: number = Math.abs(date2.getTime() - date1.getTime());
                    const optionsGain = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
			    body: JSON.stringify({ size_of_it_department : team.length, estimated_duration : diffInMs, categories : project.categories  }),
                    };

                    const responseGain = await fetch(endpointGain, optionsGain);

		    // Get project effort estimation
                    const endpointEffort = "http://localhost:3001/api/predictEffort";
		    

		    const tExp = team.reduce((acc, us) => acc + us.years_experience, 0);

                    const optionsEffort = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
			    body: JSON.stringify({ TeamExp : tExp, ManagerExp : 5, Length : diffInMs }),
                    };

                    const responseEffort = await fetch(endpointEffort, optionsEffort);

		if (response.status === 200 && responseGain.status === 200 && responseEffort.status === 200) {
	    		const fundJson = await response.json();
	   		setPredictFunds(fundJson);

			const gainJson = await responseGain.json();
			setGain(gainJson);

			const effortJson = await responseEffort.json();
			setEffort(effortJson);
		}
    	    }

	    fetchData().catch(console.error);

    }, [loaded]);

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
        onEditClose();
        setProjectName(project.name);
        setDeadline(project.deadline);
        setBudget(project.budget);
        setRepository(project.repository_link);
        setUsername("");
        setRepo("");
        setCategories(project.categories);
        setSwitchToggle(project.repository_link === "");

        
      }


    const handleEdit = async () => {
	
        const postData = {
	    project: project.id,
	    name: projectName,
	    deadline: deadline,
	    budget: budget,
	    repository_link: "",
        categories: categories,
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
            repository_link: postData.repository_link,
            categories: categories,
        }));

        onEditClose();
        setRepository(postData.repository_link);
        setRepo("");
        setUsername("");
        setSwitchToggle(postData.repository_link === "");

        

	
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
    
    const handleDeleteProject = async () => {

        const postData = {
            projectid: project.id,
        };

        const JSONdata = JSON.stringify(postData);

        const endpoint="/api/project/deleteProject";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };
        const response = await fetch(endpoint, options);

	    const responseJSON = await response.json();
        router.push("/dashboard");
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
        
        setAllTasks(oldArray => [... oldArray, responseJSON]);
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

	setCurrentTaskUsers(responseJSON.map((a: any) => a.id));
    }

    const handleUserTaskAssignment = async () => {
	
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
            <Navbar name={data?.user.name}/>
            <Box textAlign="center" mt={20} maxWidth="100vw">
                    <Flex alignItems="center" justifyContent="center">
                        <Button ml={3} position="fixed" left="0" colorScheme="teal" zIndex={2} onClick={() => router.push("/dashboard")}>< ArrowBackIcon /></Button>
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
                    <Text mt={4} as="b">Your Morale:</Text>
                    <Slider mt={2} value={project.morale} min={0} max={6} step={1} mb={10} aria-label='Your Morale'>
                            <SliderMark value={0} {...labelStyles}>
                                < FaRegFlushed color={project.morale === 0 ? 'tomato' : "none"}/>
                            </SliderMark>

                            <SliderMark value={3} {...labelStyles}>
                                < FaRegMeh />
                            </SliderMark>

                            <SliderMark value={6} {...labelStyles}>
                                < FaRegGrinBeam />
                            </SliderMark>
                                <SliderTrack bg='grey'>
                                    <Box position="relative" right={10} />
                                    <SliderFilledTrack bg={project.morale < 3 ? 'tomato' : 'green'} />
                                    <SliderThumb boxSize={3} bg={project.morale < 3 ? 'tomato' : 'green'} />
                                </SliderTrack>
                                
                            </Slider>
                </Box>

        <Tabs variant='enclosed' width="100vw" zIndex={3}>
            <TabList zIndex={3}>
                <Tab bg="white" zIndex={3}>Overview</Tab>
                <Tab>Team</Tab>
                <Tab>Tasks</Tab>
                {project.isManager && <Tab>Manage</Tab>}
            </TabList>

            <TabPanels zIndex={3}>
                <TabPanel bg="white" zIndex={3}>
                <Card maxWidth="100%">
            <CardHeader>
            <Heading size='md'>Project Details</Heading>
            </CardHeader>
            <CardBody>
                <Stack ml={0} mr={0} divider={<StackDivider />} spacing='4'>
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
                        <HStack spacing={2}>
                            {project.categories.map((cat) => (
                                <Tag colorScheme="teal">
                                    {cat}
                                </Tag>
                            ))}
                        </HStack>
                        </Flex>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Budget: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            £{project.budget}
                        </Text>
                        </Flex>
                        <Flex align="end">
                        <Text pt='2' as='b' fontSize='sm'>Team Size: &nbsp; </Text>
                        <Text pt='2' fontSize='sm'>
                            {team.length}
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
                    {project.isManager &&

                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Risk Analysis
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            {allMorales.AvgWeekMorale < 3 && allMorales.AvgDayMorale < 3 && <ErrorMessage message="Team morale is consistently low. Consistently low morale will lead to dramatically reduced productivity." />}
                            {allMorales.AvgWeekMorale < 3 && allMorales.AvgDayMorale >= 3 && <WarningMessage message="Team morale is low, but improving. Keep an eye on the team." />}
                            {allMorales.AvgDayMorale < 3 && allMorales.AvgWeekMorale >= 3 && <WarningMessage message="Your team's morale is low. This may affect the project's progress." />}
                            Something something risk we need the ML for this. {predictFunds.funding_required} {gain.project_gain} {effort.effort_required}
                        </Text>
                    </Box>
                    }
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Suggestions
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            Some suggestions!
                        </Text>
                    </Box>
                </Stack>
            </CardBody>
        </Card>
                </TabPanel>
                <TabPanel>
                <Card>
            <CardHeader>
            <Heading size='md'>Team Overview</Heading>
            </CardHeader>
            <CardBody>
                {project.isManager && (
                    <>
                    <Heading size='xs' textTransform='uppercase' mb={5}>Daily Team Morale</Heading>
                    <Slider value={allMorales.AvgDayMorale} min={0} max={6} step={1} aria-label='Week Morale' width="clamp(300px, 50%, 500px)" mb={10}>
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
                                            <SliderFilledTrack bg={allMorales.AvgDayMorale < 3 ? 'tomato' : 'green'} />
                                        </SliderTrack>
                                        
                                    </Slider>
        
        
                    <Stat mb={3}>
                            <StatNumber>{allMorales.AvgDayMorale}<Text as="sub" color="grey">/6</Text></StatNumber>
                            <StatHelpText>
                                <StatArrow type={allMorales.AvgDayMorale >= allMorales.AvgWeekMorale ? 'increase' : 'decrease'} />
                                {(Math.abs((allMorales.AvgDayMorale - allMorales.AvgWeekMorale)) / allMorales.AvgWeekMorale * 100).toFixed(2)}% from weekly avg.
                            </StatHelpText>
                        </Stat>
        
        
        
                    <Divider mt={3} mb={3} />
                    </>
                )}
            
            <Heading size='xs' textTransform='uppercase' mb={5}>Team Composition</Heading>
            <List spacing={3}>
				    {team.map((e, i) => (
					    <Flex align="center" key={i}><Avatar name={e.forename + " " + e.surname} mr={3}/><ListItem key={i}>{e.forename} {e.surname}</ListItem>{e.id === data?.user.id && <Text fontSize="xs" as="b" color="grey">&nbsp; (you)</Text>}{project.isManager && <Text>&nbsp; {e.years_experience} years experience</Text>}</Flex>
				    ))}
			    </List>
            <Text mt={3} size="sm">({team.length} total)</Text>

                
            {project.isManager && <Button onClick={onInviteOpen} mt={5}>Invite User</Button>}
            </CardBody>
        </Card>
                </TabPanel>
                <TabPanel>
                <Card>
            <CardHeader>
            <Heading size='md'>Task Overview</Heading>
            </CardHeader>
            <CardBody>
            {allTasks.length > 0 ? 
            <List spacing={3}>
            {allTasks.map((e, i) => (
                <ListItem key={i}><Button onClick={() => handleShowTask(e)}>{e.name}</Button></ListItem>
            ))}
		    </List> : "No tasks yet!"}

            </CardBody>
            <CardFooter>
            {project.isManager && <Button onClick={onTaskFormOpen} mt={5}>Add Task</Button>}
            </CardFooter>
        </Card>
                </TabPanel>
                {project.isManager && <TabPanel>
                    <Card>
            <CardHeader>
            <Heading size='md'>Manage Project</Heading>
            </CardHeader>
            <CardBody>
                <Wrap>
                    <WrapItem>
                        <Button colorScheme="orange" onClick={onDeleteProjectOpen}>Delete Project</Button>
                    </WrapItem>
                    <WrapItem>
                        <Button colorScheme="red" onClick={onAbandonProjectOpen}>Abandon project</Button>
                    </WrapItem>
                    <WrapItem>
                        <Button colorScheme="green" onClick={onCompleteProjectOpen}>Complete project</Button>
                    </WrapItem>
                </Wrap>
            </CardBody>
        </Card>
                    </TabPanel>}
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
        
            {project.isManager && 
            <>
            <AlertDialog
            isOpen={isDeleteProjectOpen}
            leastDestructiveRef={cancelRef}
            isCentered
            onClose={() => {
                setManageProjectConfirmation("");
                onDeleteProjectClose();}}
          >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Project
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                            Please type <Text as="b">delete {project.name}</Text> to confirm.
                            <Input mt={2} placeholder={`delete ${project.name}`} onChange={(e) => setManageProjectConfirmation(e.target.value)}/>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => {
                                setManageProjectConfirmation("");
                                onDeleteProjectClose();}}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleDeleteProject} ml={3} isDisabled={manageProjectConfirmation !== ("delete " + project.name)}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
          </AlertDialog>

          <AlertDialog
            isOpen={isAbandonProjectOpen}
            leastDestructiveRef={cancelRef}
            isCentered
            onClose={() => {
                setManageProjectConfirmation("");
                onAbandonProjectClose();}}
          >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Abandon Project
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                            Please type <Text as="b">abandon {project.name}</Text> to confirm.
                            <Input mt={2} placeholder={`abandon ${project.name}`} onChange={(e) => setManageProjectConfirmation(e.target.value)}/>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => {
                                setManageProjectConfirmation("");
                                onAbandonProjectClose();}}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={onAbandonProjectClose} ml={3} isDisabled={manageProjectConfirmation !== ("abandon " + project.name)}>
                                Abandon
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
          </AlertDialog>


            <AlertDialog
            isOpen={isCompleteProjectOpen}
            leastDestructiveRef={cancelRef}
            isCentered
            onClose={() => {
                setManageProjectConfirmation("");
                onCompleteProjectClose();}}
          >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Complete Project
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                            Please type <Text as="b">complete {project.name}</Text> to confirm.
                            <Input mt={2} placeholder={`complete ${project.name}`} onChange={(e) => setManageProjectConfirmation(e.target.value)}/>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => {
                                setManageProjectConfirmation("");
                                onCompleteProjectClose();}}>
                                Complete
                            </Button>
                            <Button colorScheme='green' onClick={onCompleteProjectClose} ml={3} isDisabled={manageProjectConfirmation !== ("complete " + project.name)}>
                                Complete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
          </AlertDialog>
          </>
          }
        

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
	    			<Card>
	    				<CardBody>
	    					<Stack pb={3} direction='row'>
	    			<Center>
				    {currentTask.description}
				</Center>
	    			<Spacer/>
	    			</Stack>
	    			<Divider/>
	            		<Heading py={3} size='sm' textTransform='uppercase'>
	    				Assign Task
				</Heading>

	    				<CheckboxGroup value={currentTaskUsers}>
						<Stack spacing={1} direction='column'>
						    {team.map((e, i) => (
							    <Checkbox isDisabled={!project.isManager} defaultChecked={currentTaskUsers.includes(e.id)} key={i} value={e.id} onChange={handleSelectUserForTask}>{e.forename} {e.surname}</Checkbox>
						    ))}
						</Stack>
	    				</CheckboxGroup>
	    				<AvatarGroup mt={4} size='md' max={2}>
	    					{team.filter((e, i) => (currentTaskUsers.includes(e.id))).map((e, i) => (
							<Avatar name={e.forename + " " + e.surname}/>
						))}
	    				</AvatarGroup>
	    				</CardBody>
	    			</Card>

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

                            <FormControl mt={4} >
                                <FormLabel>Project Category</FormLabel>
                                <ReactSelect
        isMulti
        options={categoryList}
        placeholder="Select some colors..."
        closeMenuOnSelect={false}
        selectedOptionColor="green"
        hideSelectedOptions={false}
        defaultValue={project.categories.map((e) => ({value: e, label: e}))}
        onChange={(e) => {setCategories(e.map((e2) => e2.value))
        }}
      />

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
                            <Input defaultValue={project.repository_link} onChange={event => setRepository(event.currentTarget.value)}/>
                         </FormControl>   
                            }
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
                            <Slider defaultValue={3} min={0} max={6} step={1} aria-label='morale slider' onChange={(val) => setMorale(val)}>
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
                                    <SliderFilledTrack bg={morale < 3 ? 'tomato' : 'green'} />
                                </SliderTrack>
                                <SliderThumb boxSize={3} bg="orange" />
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
  
