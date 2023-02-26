import type { NextApiRequest, NextApiResponse } from 'next';
import type { Morale } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {

	switch (req.method) {
		case 'POST':
			const { p_id, u_id, submit_date, morale_val } = 
				req.body as Morale;

			try {
				const morale = await prisma.morale.create({
					data: {
						project: p_id,
						u_id: u_id,
						submit_date: submit_date,
						morale: morale_val,
					},

				});

				res.status(201).json(morale);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

