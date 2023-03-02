import type { NextApiRequest, NextApiResponse } from 'next';
import type { Morale } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project, u_id, submit_date, morale } = 
				req.body as Morale;

			try {
				const morale_obj = await prisma.morale.create({
					data: {
						project: project,
						u_id: u_id,
						submit_date: submit_date,
						morale: morale,
					},

				});

				res.status(201).json(morale_obj);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

