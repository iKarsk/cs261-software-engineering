import React from 'react';
import { Box, Divider, Button, Flex, Spacer, Heading} from '@chakra-ui/react';
import { signOut } from "next-auth/react"

export default function Navbar() {
    return (
        <Box as="header" position="fixed" width="100%" bg="white" zIndex={200}>
            <Flex width="100%" mt={3}>
                <Heading ml={6} size="lg">Project Tracker</Heading>
                <Spacer />
                <Button onClick={() => signOut()} colorScheme='teal' mr={6}>Log out</Button>
            </Flex>
            
            <Divider mt={3} />
        </Box>

    );
}