import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { userid } = req.body;

			try {
				// Get all projects user is part of
				const projectArr = await prisma.project_developers.findMany({
					where: {
						u_id: Number(userid)
					} 
				});

				let extracted = projectArr.map(a => a.project); // Extract project IDs

				// Get all projects details
				const projects = await prisma.projects.findMany({
					where: {
						id: { in: extracted.map(Number) }
					}
				});

				res.status(200).json(projects);
			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

