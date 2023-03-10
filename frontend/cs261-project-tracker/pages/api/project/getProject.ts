import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { userid, projectid } = req.body;

			try {
				// Check whether user is part of project
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

					const morale = await prisma.morale.findMany({
						where: {
							project: Number(projectid),
							u_id: Number(userid),
							submit_date: new Date(),
							}
						}
					)

				
					const jsonOBJ = JSON.parse(JSON.stringify(project));
					jsonOBJ.isManager = projectDeveloper.ismanager;
					jsonOBJ.morale = (morale.length > 0) ? morale[0].morale : -1;


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

