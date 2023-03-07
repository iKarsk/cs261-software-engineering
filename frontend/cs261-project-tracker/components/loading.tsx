import { Center, Spinner } from '@chakra-ui/react'

export default function Loading() {
    return(
        <Center h='100vh' w="100vw"><Spinner color='red.500'/></Center>
    )
}