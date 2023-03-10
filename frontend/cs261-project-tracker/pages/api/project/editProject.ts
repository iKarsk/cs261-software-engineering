import type { NextApiRequest, NextApiResponse } from 'next';
import type { ProjectEdit } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project, name, deadline, budget, repository_link, categories } = 
				req.body as ProjectEdit;

			try {
				const updateProject = await prisma.projects.update({
					where: {
						id: Number(project),
					},
					data: {
						name: name,
						deadline: new Date(deadline),
						budget: Number(budget),
						repository_link: repository_link,
						categories: categories,
					},
				});

				res.status(200).json(updateProject);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



