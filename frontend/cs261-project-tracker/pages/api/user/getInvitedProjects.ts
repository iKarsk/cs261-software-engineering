import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import type { Project } from '../../../interfaces';


export default async function handler(req: NextApiRequest, res: NextApiResponse<Project[]>) {

	switch (req.method) {
		case 'POST':
			const { userid } = req.body;

			try {
				// Get user invites given user id
				const invitations = await prisma.user_invites.findMany({
					where: {
						u_id: Number(userid)
					} 
				});


				// Get all projects user is invited to
				const projects = await prisma.projects.findMany({
					where: {
						id: { in: invitations.map(Number) }
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

