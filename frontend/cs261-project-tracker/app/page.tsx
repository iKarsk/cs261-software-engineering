'use client';
import styles from './page.module.css'
import { Heading, Flex, Button, Kbd, Text, Box } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();

  return (
    <Flex direction="column" align="center" justify="center" h="100vh">
      <Heading as="h1" size="3xl" mb={2}>Project Tracker</Heading>
      <Heading as="h2" size="md">A project management tool for CS261</Heading>
      <Button colorScheme="teal" mt={3} onClick={() => router.push("/login")}>Login</Button>


      <Text mt={20} as="b" fontSize="lg" mb={1}>This website is accessible!</Text>
      <span>
        Navigate with: &nbsp; <Kbd>tab</Kbd>, <Kbd>arrowkeys</Kbd> and <Kbd>enter</Kbd>
      </span>

    </Flex>

    /*
    <div className={styles.container}>
      <p><span className={styles.magic}>Hello.</span></p>
      <Link href="/login"><p className={styles.subtext}>Login.</p></Link>
    </div>
    */
  )
}
