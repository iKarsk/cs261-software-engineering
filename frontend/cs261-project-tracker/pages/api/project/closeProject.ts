import type { NextApiRequest, NextApiResponse } from 'next';
import type { ProjectEdit } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { projectid, status } = req.body;

			try {
				const updateProject = await prisma.projects.update({
					where: {
						id: Number(projectid),
					},
					data: {
                        status: status ? 1 : -1,
						end_date: new Date(),
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



