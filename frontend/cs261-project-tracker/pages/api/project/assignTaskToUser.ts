import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserTask } from '../../../interfaces';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    switch (req.method) {
        case 'POST':
            const { task, userArr } = req.body as UserTask;

            try {
		// Check if the records already exist in the database
		const existingRecords = await prisma.user_tasks.findMany({
		  where: {
		    task: task,
		    u_id: { in: userArr },
		  },
		  select: { u_id: true },
		})

		// Filter out the ids that already exist in the database
		const newIds = userArr.filter(id => !existingRecords.find(r => r.u_id === id))


		const recordsToCreate = userArr.map((id) => {
			return {
				task: task,
				u_id: id,
			};
		});

                // Assign task to user
                const newUserTask = await prisma.user_tasks.createMany({
                    data: recordsToCreate,
                });

		// Delete any records that are not in the given array of ids
		const deletedRecords = await prisma.user_tasks.deleteMany({
		  where: {
		    task: task,
		    NOT: {
		      u_id: { in: userArr },
		    },
		  },
		})

                return res.status(201).json(newUserTask);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal server error');
            }

        default:
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

