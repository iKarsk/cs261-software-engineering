import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {



	switch (req.method) {
		case 'POST':
			const { projectid } = req.body;

			try {

                const allMorales = await prisma.morale.findMany({
                    where: {
                        project: Number(projectid),
                    },
                    select: {
                        morale: true,
                    }
                    }
                )

                const moraleOBJ: any= {} 
                
                if(allMorales.length){
                    const avgMorale = allMorales.reduce((a, b) => a + b.morale, 0) / allMorales.length;
                    moraleOBJ.AvgMorale = avgMorale;
                }

                if(!allMorales.length){
                    res.status(400).json("No morale data for this project");
                }else{
                    res.status(200).json(moraleOBJ);
                }

			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

