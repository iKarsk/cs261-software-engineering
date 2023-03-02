import type { NextApiRequest, NextApiResponse } from 'next';
import type { Invite } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project, u_id } = 
				req.body as Invite;

			try {
				// Check if invitation already exists
				const existingInvitation = await prisma.user_invites.findUnique({
				  where: { project_u_id: { project: project, u_id } },
				});

				if (existingInvitation) {
				  res.status(409).send('User is already invited to this project');
				}
				
				// Create new invitation
				const invitation = await prisma.user_invites.create({
					data: {
						project: project,
						u_id: u_id,
					},

				});

				res.status(201).json(invitation);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

