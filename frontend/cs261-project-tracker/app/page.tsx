'use client';
import styles from './page.module.css'
import { Heading, Flex, Button, Kbd, Text, Spacer } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();

  return (
    <Flex direction="column" align="center" justify="center" h="100vh">
      <Spacer />
      <Flex direction="column" align="center" justify="center">
      <Heading as="h1" size="3xl" mb={2}>Project Tracker</Heading>
      <Heading as="h2" size="md">A project management tool for CS261</Heading>
      <Button colorScheme="teal" mt={3} onClick={() => router.push("/login")}>Login &nbsp;<ArrowForwardIcon /></Button>
      </Flex>
      <Spacer />

      <Flex direction="column" align="center" justify="center" mb={50} position="fixed" bottom="0">
      <Text mt={20} as="b" fontSize="lg" mb={1}>This website is accessible!</Text>
      <span>
        Navigate with: &nbsp; <Kbd>tab</Kbd>, <Kbd>arrowkeys</Kbd> and <Kbd>enter</Kbd>.
      </span>
      </Flex>
    </Flex>

    /*
    <div className={styles.container}>
      <p><span className={styles.magic}>Hello.</span></p>
      <Link href="/login"><p className={styles.subtext}>Login.</p></Link>
    </div>
    */
  )
}
