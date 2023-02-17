import type { NextApiRequest, NextApiResponse } from 'next';
import type { User } from '../../../interfaces';
import bcrypt from 'bcrypt';
import prisma from '@prisma/client';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {

	switch (req.method) {
		case 'POST':
			const { forename, surname, emial, password, yearsofexperience } = 
				req.body as User;

			try {
				// Check whether email already in use
				const existingUser = await prisma.user.findUnique({ where: { email } });
				if (existingUser) {
					res.status(400).send("Email in use already");
				}

				const hashedPassword = await bcrypt.hash(password, 5);

				const user = await prisma.user.create({
					data: {
						forename,
						surname,
						email,
						password: hashedPassword,
						yearsofexperience,
					},
				});

				res.status(201).json(user);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${method} Not Allowed`);
  }
}



