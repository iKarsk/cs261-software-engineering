import { Box, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, useDisclosure,  } from '@chakra-ui/react'
import { Session } from 'next-auth/core/types';
import { Dispatch, SetStateAction, useState } from 'react';
import { FaRegFlushed, FaRegGrinBeam, FaRegMeh } from 'react-icons/fa'





export default function MoraleForm({ data } : { data: Session | null }, { project } : { project: {
    id: number;
    name: string;
    start_date: string;
    isManager: boolean;
    budget: number;
    deadline: string;
    repository_link: string;
} }, { needMorale } : { needMorale: boolean }, { setNeedMorale } : { setNeedMorale: Dispatch<SetStateAction<boolean>> }) {

    const [morale, setMorale] = useState(0);
    const { isOpen: isMoraleOpen, onOpen: onMoraleOpen, onClose: onMoraleClose } = useDisclosure();


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

        console.log(response);

        onMoraleClose();
        setNeedMorale(false);

    }

    const labelStyles = {
        mt: '3',
        ml: '-2.5',
        fontSize: '2xl',
      }
    
    return(
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
    )
}