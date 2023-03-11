import React from 'react';
import { Box, Divider, Button, Flex, Spacer, Heading, Text} from '@chakra-ui/react';
import { signOut } from "next-auth/react"
import { Avatar } from '@chakra-ui/react';

export default function Navbar({ name }: { name: any }) {
    return (
        <Box as="header" position="fixed" width="100%" bg="white" zIndex={200}>
            <Flex width="100%" mt={3}>
                <Heading ml={6} size="lg" position="fixed" left="0">Project Tracker</Heading>
                <Spacer />
                <Flex align="center">
                <Avatar name={name}></Avatar>
                <Text as="b" ml={2}>{name}</Text>
                </Flex>
                <Spacer />
                <Button position="fixed" right="0" onClick={() => signOut()} colorScheme='teal' mr={6}>Log out</Button>
            </Flex>
            
            <Divider mt={3} />
        </Box>

    );
}