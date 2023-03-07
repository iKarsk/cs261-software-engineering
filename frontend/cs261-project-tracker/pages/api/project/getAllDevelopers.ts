import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import type { Task } from '../../../interfaces';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project } = req.body;

			try {
				// Get all project developers/managers
				const allIds = await prisma.project_developers.findMany({
					where: {
						project: Number(project)
					} 
				});


				let developers = allIds.map(a => a.u_id); // Extract user IDs


				// Get all user information of all users
				const users = await prisma.users.findMany({
					where: {
						id: { in: developers.map(Number) },
					},
				})

				res.status(200).json(users);
			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

