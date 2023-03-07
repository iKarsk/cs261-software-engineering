import type { NextApiRequest, NextApiResponse } from 'next';
import type { Developer } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project, u_id, ismanager } = req.body as Developer;

			try {
				// Check if user is already a developer for the project
				const existingDeveloper = await prisma.project_developers.findUnique({
				  where: {
				    project_u_id: {
				      project: project,
				      u_id: u_id
				    }
				  }
				});

				if (existingDeveloper) {
				  return res.status(409).json({
				    message: `Project developer with p_id ${project} and u_id ${u_id} already exists`
				  });
				}

				// Add user to project as developer 
				const developer = await prisma.project_developers.create({
					data: {
						project: project,
						u_id: u_id,
						ismanager: ismanager,
					},

				});

				res.status(201).json(developer);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

