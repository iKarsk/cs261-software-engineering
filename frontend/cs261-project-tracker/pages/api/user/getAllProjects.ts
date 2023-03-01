import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import type { Project } from '../../../interfaces';


export default async function handler(req: NextApiRequest, res: NextApiResponse<Project[]>) {

	switch (req.method) {
		case 'POST':
			const { userid } = req.body;

			try {
				// Get all projects user is part of
				const projectIds = await prisma.project_developers.findMany({
					where: {
						u_id: Number(userid)
					} 
				});


				// Get all projects details
				const projects = await prisma.projects.findMany({
					where: {
						id: { in: projectIds.map(Number) }
					}
				});

				res.status(200).json(projects);
			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

