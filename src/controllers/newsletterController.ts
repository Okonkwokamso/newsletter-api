import { Request, Response } from 'express';
import prisma from '../config/prismaClient'; 

export const createNewsletter = async (req: Request, res: Response) => {
  const { title, content } = req.body;

  try {
    const newNewsletter = await prisma.newsletter.create({
      data: {
        title,
        content,
      },
    });
    res.status(201).json(newNewsletter);
  } catch (error) {
    res.status(500).json({ error: 'Error creating newsletter' });
  }
};

export const getAllNewsletters = async (_req: Request, res: Response) => {
  try {
    const newsletters = await prisma.newsletter.findMany();
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching newsletters' });
  }
};

export const getNewsletterById = async (req: Request, res: Response):Promise<void> => {
  const { id } = req.params;

  try {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: Number(id) },
    });
    if (!newsletter) {
      res.status(404).json({ error: 'Newsletter not found' });
      return;
    }
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching newsletter' });
  }
};

export const updateNewsletter = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  // Worked with only PUT request method 
  /*try {
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: Number(id) },
      data: { title, content },
    });
    res.json(updatedNewsletter);
  } catch (error) {
    res.status(500).json({ error: 'Error updating newsletter' });
  }*/

  try {
    // Prepare the partial update object with only provided fields
    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;

    // Check if there are fields to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields provided for update' });
      return;
    }

    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(updatedNewsletter);
  } catch (error) {
    res.status(500).json({ error: 'Error updating newsletter' });
  }

};

export const deleteNewsletter = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.newsletter.delete({
      where: { id: Number(id) },
    });
    res.status(204).end(); // No content to send back
  } catch (error) {
    res.status(500).json({ error: 'Error deleting newsletter' });
  }
};










