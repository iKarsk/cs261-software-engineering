import type { NextApiRequest, NextApiResponse } from 'next';
import type { User } from '../../../interfaces';
import bcrypt from 'bcrypt';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { forename, surname, email, password, yearsofexperience } = 
				req.body as User;	

			try {
				// Check whether email already in use
				const existingUser = await prisma.users.findUnique({ where: { email } });
				if (existingUser) {
					return res.status(409).send("Email in use already");
				}

				const hashedPassword = await bcrypt.hash(password, 5); // Hash password before storing

				const user = await prisma.users.create({
					data: {
						forename: forename,
						surname: surname,
						email: email,
						password: hashedPassword,
						years_experience: yearsofexperience,
					},
				});

				const userObj = {
					id: user.id,
					name: user.forename + " " + user.surname,
					email: user.email,
				}

				res.status(201).json(userObj);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



