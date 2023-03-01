import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import type { Task } from '../../../interfaces';


export default async function handler(req: NextApiRequest, res: NextApiResponse<Task[]>) {

	switch (req.method) {
		case 'POST':
			const { projectid } = req.body;

			try {
				// Get all project tasks given project id
				const tasks = await prisma.project_tasks.findMany({
					where: {
						project: Number(projectid)
					} 
				});

				res.status(200).json(tasks);
			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

