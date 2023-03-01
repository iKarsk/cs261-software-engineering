'use client';

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'

 import { SessionProvider } from "next-auth/react";

 export default function AppProviders({ children }) {
    return <SessionProvider><CacheProvider><ChakraProvider>{ children }</ChakraProvider></CacheProvider></SessionProvider>
 } 