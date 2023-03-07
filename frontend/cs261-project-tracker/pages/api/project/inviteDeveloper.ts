import type { NextApiRequest, NextApiResponse } from 'next';
import type { Invite } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project, email, ismanager } = 
				req.body as Invite;

			try {
				// Get user email from their id
				const getUserId = await prisma.users.findUnique({
					where: {
						email: email,
					},
				});

				if (!getUserId) {	
					return res.status(404).json({ message: "User not found"});
				}

				let u_id = getUserId["id"];


				// Check if invitation already exists
				const existingInvitation = await prisma.user_invites.findUnique({
					where: { 
						project_u_id: { 
							project: project, u_id 
						},
					},
				});

				if (existingInvitation) {
				  	return res.status(409).json({ message: "User already invited"});
				}
				
				// Create new invitation
				const invitation = await prisma.user_invites.create({
					data: {
						project: project,
						u_id: u_id,
						ismanager: ismanager,
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

