import type { NextApiRequest, NextApiResponse } from 'next';
import type { Task } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {

	switch (req.method) {
		case 'POST':
			const { p_id, name, desc, start, deadline, end, progress, risk } = 
				req.body as Task;

			try {
				const task = await prisma.project_tasks.create({
					data: {
						project: p_id,
						name: name,
						description: desc,
						start_date: start,
						deadline: deadline,
						end_date: end,
						progress: progress,
						risk: risk,
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



