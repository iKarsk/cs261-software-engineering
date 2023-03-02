import type { NextApiRequest, NextApiResponse } from 'next';
import type { ProjectInput } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { u_id, name, deadline, budget, repository_link } = 
				req.body as ProjectInput;

			try {
				const project = await prisma.projects.create({
					data: {
						name: name,
						start_date: new Date(),
						deadline: deadline,
						budget: budget,
						end_date: new Date(Date.now()), // Idk can't have null values for some reason...
						risk: -1,
						repository_link: repository_link,
					},

				});


				const developer = await prisma.project_developers.create({
					data: {
						project: project.id,
						u_id: u_id,
						ismanager: true,
					},
				});

				res.status(201).json(project);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



