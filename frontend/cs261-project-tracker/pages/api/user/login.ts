import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import prisma from '@prisma/client';
import { LoginInput, User } from '../../../interface';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {

	switch (req.method) {
		case 'POST':
			const { email, password } = req.body as LoginInput;

			try {
				const user = await prisma.user.findUnique({ where: { email } });

				if (!user) {
					return res.status(401).send("User not found");
				}

				const passwordMatch = await bcrypt.compare(password, user.password);

				if (!passwordMatch) {
					return res.status(401).send("Incorrect password");
				}

				res.status(200).json(user);
			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

