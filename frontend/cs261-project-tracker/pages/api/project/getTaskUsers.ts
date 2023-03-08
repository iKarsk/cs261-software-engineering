import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { taskid } = req.body;

			try {

				const tasks = await prisma.user_tasks.findMany({
				    where: {
					    task: taskid,
					},
				});

				let userIds = tasks.map(a => a.u_id);

				// Get all user information of all users
				const users = await prisma.users.findMany({
					where: {
						id: { in: userIds.map(Number) },
					},
				})

				res.status(200).json(users);
				const task = await prisma.project_tasks.findUnique({
				    where: {
					    id: taskid,
					},
				});

			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

