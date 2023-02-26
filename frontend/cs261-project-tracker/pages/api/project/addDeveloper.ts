import type { NextApiRequest, NextApiResponse } from 'next';
import type { Developer } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {

	switch (req.method) {
		case 'POST':
			const { p_id, u_id, is_manager } = 
				req.body as Developer;

			try {
				const developer = await prisma.project_developers.create({
					data: {
						project: p_id,
						u_id: u_id,
						ismanager: is_manager,
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

