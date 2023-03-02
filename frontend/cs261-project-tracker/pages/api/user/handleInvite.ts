import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import type { HandleInvite } from "../../../interfaces";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project, u_id, accept } = req.body as HandleInvite;

			try {
				// Check whether user is invited to project
				const invitation = await prisma.user_invites.findUnique({
					where: {
						project_u_id: {
							project: Number(project),
							u_id: Number(u_id),
						}
					}, 
				});

				if (invitation) {
					// Delete user invitation
					await prisma.user_invites.delete({
						where: {
							project_u_id: {
								project: invitation.project,
								u_id: invitation.u_id,
							}
						}
					});


					// Add user to project if invitation accepted
					if (accept) {
						const project = await prisma.project_developers.create({
							data: {
								project: invitation.project,
								u_id: invitation.u_id,
								ismanager: false,
							},
						});

						res.status(200).json(project);
					}

					res.status(204).end();
				}


				res.status(404).send("Invite not found");
			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

