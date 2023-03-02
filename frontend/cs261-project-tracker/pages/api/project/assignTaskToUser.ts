import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserTask } from '../../../interfaces';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    switch (req.method) {
        case 'POST':
            const { task, u_id } = req.body as UserTask;

            try {
                // Check if user is already assigned to the task
                const existingUserTask = await prisma.user_tasks.findFirst({
                    where: {
                        task: task,
                        u_id: u_id,
                    },
                });

                if (existingUserTask) {
                    res.status(409).json({ message: 'User is already assigned to task' });
                }

                // Assign task to user
                const newUserTask = await prisma.user_tasks.create({
                    data: {
                        task: task,
                        u_id: u_id,
                    },
                });

                res.status(201).json(newUserTask);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal server error');
            }

        default:
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

