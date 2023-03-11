import type { NextApiRequest, NextApiResponse } from 'next';
import type { ProjectEdit } from '../../../interfaces';
import { prisma } from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	switch (req.method) {
		case 'POST':
			const { projectid } = req.body;

			try {
                const deleteMorales = prisma.morale.deleteMany({
                    where: {
                        project: Number(projectid),
                    },
                });

                const deleteDevelopers = prisma.project_developers.deleteMany({
                    where: {
                        project: Number(projectid),
                    },
                });

                const deleteTasks = prisma.project_tasks.deleteMany({
                    where: {
                        project: Number(projectid),
                    }
                });

                const deleteInvites = prisma.user_invites.deleteMany({
                    where: {
                        project: Number(projectid),
                    },
                });

				const deleteProject = prisma.projects.delete({
					where: {
						id: Number(projectid),
					},

				});

                const transaction = await prisma.$transaction([deleteMorales, deleteDevelopers, deleteTasks, deleteInvites, deleteProject]);

				res.status(200).json(transaction);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal server error");
			}

			break;
		default:
			res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



