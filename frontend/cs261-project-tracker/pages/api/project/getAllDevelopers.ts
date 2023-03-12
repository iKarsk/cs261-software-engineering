import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import type { Task } from '../../../interfaces';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { project } = req.body;

			try {
				// Get all project developers/managers
				const allIds = await prisma.project_developers.findMany({
					where: {
						project: Number(project)
					} 
				});


				let developers = allIds.map(a => a.u_id); // Extract user IDs


				// Get all user information of all users
				const users = await prisma.users.findMany({
					where: {
						id: { in: developers.map(Number) },
					},
				})

				const obj = [];

				for(var user in users){
					const morale = await prisma.morale.findFirst({
						where :{
							project: Number(project),
							u_id: users[user].id,
							submit_date: new Date(),
						},
						select: {
							morale: true,
						},
					});

					const yesterdaysMorale = await prisma.morale.findFirst({
						where :{
							project: Number(project),
							u_id: users[user].id,
							submit_date: new Date(new Date().setDate(new Date().getDate() - 1)),
						}
					})

					if(morale){
						if(yesterdaysMorale){
							obj.push({
								...users[user],
								morale: morale.morale,
								yesterdaysMorale: yesterdaysMorale.morale,
							});		
						}else{
							obj.push({
								...users[user],
								morale: morale.morale,
								yesterdaysMorale: null,
							});
						}
					} else{
						obj.push({
							...users[user],
							morale: null
						});
					}
				}

				res.status(200).json(obj);
			} catch (error) {
				
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

