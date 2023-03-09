import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {


    function setToMonday( date: Date ) {
        var day = date.getDay() || 7;  
        if( day !== 1 ) 
            date.setHours(-24 * (day - 1)); 
        return date;
    }


	switch (req.method) {
		case 'POST':
			const { projectid } = req.body;

			try {

                const weekMorale = await prisma.morale.findMany({
                    where: {
                        project: Number(projectid),
                        submit_date: {
                            lte: new Date(),
                            gte: setToMonday(new Date()),
                        }
                    },
                    select: {
                        morale: true,
                    }
                    }
                )

                const dayMorale = await prisma.morale.findMany({
                    where :{
                        project: Number(projectid),
                        submit_date: new Date(),
                    },
                    select: {
                        u_id: true,
                        morale: true,
                    }
                })

                const moraleOBJ: any= {} 
                
                if(weekMorale.length){
                    const avgWeekMorale = weekMorale.reduce((a, b) => a + b.morale, 0) / weekMorale.length;
                    moraleOBJ.AvgWeekMorale = avgWeekMorale;
                }
                
                if(dayMorale.length){
                    const avgDayMorale = dayMorale.reduce((a, b) => a + b.morale, 0) / dayMorale.length;
                    moraleOBJ.DayMorale = dayMorale;
                    moraleOBJ.AvgDayMorale = avgDayMorale;
                }

                if(!weekMorale.length && !dayMorale.length){
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

