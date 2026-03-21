import { Response, NextFunction } from 'express';
import { ContactService } from '../services/contact.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import Contact from '../models/Contact.js';

export const submitContact = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    const contact = await ContactService.create(req.body, ipAddress);
    res.status(201).json({ status: 'success', data: contact });
  } catch (err) {
    next(err);
  }
};

export const listContacts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, status, search } = req.query as Record<string, string>;
    const { rows, count } = await ContactService.findAll({
      page: Number(page),
      limit: Number(limit),
      status,
      search,
    });
    res.json({ status: 'success', total: count, data: rows });
  } catch (err) {
    next(err);
  }
};

export const exportContacts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workbook = await ContactService.exportToExcel(req.query as any);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="hubox-contacts-${Date.now()}.xlsx"`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

export const updateContactStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };
    const validStatuses = ['new', 'contacted', 'archived'];
    if (!validStatuses.includes(status)) return next(new AppError('Invalid status', 400));
    const [updated] = await Contact.update({ status } as any, { where: { id } });
    if (!updated) return next(new AppError('Contact not found', 404));
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};
