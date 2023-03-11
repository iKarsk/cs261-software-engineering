import React from 'react';
import { Box, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react';

export default function WarningMessage({ message }: { message: string}) {
    return (
        <Box my={4}>
            <Alert status="warning" borderRadius={4}>
                <AlertIcon />
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        </Box>
    );
}