import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { userid, projectid } = req.body;

			try {
				// Get all projects user is part of
                const projectDeveloper = await prisma.project_developers.findUnique({
                    where: {
                        project_u_id:{
                            project: Number(projectid),
                            u_id: Number(userid),
                        },
                    },
                })

                if(projectDeveloper){
                    try { 
                        const project = await prisma.projects.findUnique({
                            where: {
                                id: Number(projectid),
                            }
                        })

                        const jsonOBJ = JSON.parse(JSON.stringify(project));
                        jsonOBJ.isManager = projectDeveloper.ismanager;


                        res.status(200).json(jsonOBJ);
                    } catch (error) {
                        console.error(error);
                        res.status(500).send("Internal server error");
                    }
                }else{
                    res.status(400).send("Project doesn't exist or user is not part of project");
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

