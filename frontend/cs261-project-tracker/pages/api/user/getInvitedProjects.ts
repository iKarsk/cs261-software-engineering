import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { userid } = req.body;

			try {
				// Get user invites given user id
				const invitationsArr = await prisma.user_invites.findMany({
					where: {
						u_id: Number(userid)
					} 
				});

				let invitationIds = invitationsArr.map(a => a.project); // Extract invitation IDs

				// Get all projects user is invited to
				const projects = await prisma.projects.findMany({
					where: {
						id: { in: invitationIds.map(Number) }
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

