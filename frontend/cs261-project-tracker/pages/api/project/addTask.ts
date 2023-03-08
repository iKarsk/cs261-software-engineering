import type { NextApiRequest, NextApiResponse } from 'next';
import type { Task } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project, name, description, deadline } = 
				req.body as Task;

			try {
				const task = await prisma.project_tasks.create({
					data: {
						project: project,
						name: name,
						description: description,
						start_date: new Date(),
						deadline: new Date(deadline),
					},

				});

				res.status(201).json(task);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



