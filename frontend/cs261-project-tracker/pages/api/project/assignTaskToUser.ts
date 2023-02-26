import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserTask } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {

	switch (req.method) {
		case 'POST':
			const { t_id, u_id, is_manager } = 
				req.body as UserTask;

			try {
				const usertask = await prisma.user_tasks.create({
					data: {
						task: t_id,
						u_id: u_id,
					},

				});

				res.status(201).json(usertask);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

