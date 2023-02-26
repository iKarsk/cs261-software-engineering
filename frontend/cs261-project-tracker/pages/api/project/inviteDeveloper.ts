import type { NextApiRequest, NextApiResponse } from 'next';
import type { Invite } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {

	switch (req.method) {
		case 'POST':
			const { p_id, u_id } = 
				req.body as Invite;

			try {
				const invitation = await prisma.user_invites.create({
					data: {
						project: p_id,
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

