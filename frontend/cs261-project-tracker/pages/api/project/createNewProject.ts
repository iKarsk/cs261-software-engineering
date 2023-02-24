import type { NextApiRequest, NextApiResponse } from 'next';
import type { Project } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {

	switch (req.method) {
		case 'POST':
			const { name, start, deadline, end, budget, risk, respository } = 
				req.body as Project;

			try {
				const project = await prisma.projects.create({
					data: {
						name: name,
						start_date: start,
						deadline: deadline,
						end_date: end,
						budget: budget,
						risk: risk,
						repository_link: repository,
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



