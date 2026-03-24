import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import Contact from '../models/Contact.js';
import { AppError } from '../middleware/errorHandler.js';
import { sequelize } from '../config/database.js';

const DUPLICATE_WINDOW_HOURS = 24;

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

const checkDuplicateSubmission = async (email: string): Promise<void> => {
  const cutoff = new Date(Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000);
  try {
    const existing = await Contact.findOne({
      where: sequelize.literal(`email = '${email}' AND created_at >= '${cutoff.toISOString().slice(0, 19).replace('T', ' ')}'`),
    });
    if (existing) throw new AppError('A submission from this email already exists within 24h', 409);
  } catch (err: any) {
    if (err.statusCode === 409) throw err;
    console.error('Duplicate check error:', err.message);
  }
};

const create = async (data: Partial<Contact>, ipAddress: string): Promise<Contact> => {
  await checkDuplicateSubmission(data.email as string);
  try {
    return await Contact.create({ ...data, ipAddress, source: 'web' } as any);
  } catch (err) {
    console.error('Contact create error:', JSON.stringify(err));
    throw err;
  }
};

const findAll = async ({ page = 1, limit = 20, status, search }: ListParams = {}) => {
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { company: { [Op.like]: `%${search}%` } },
    ];
  }
  return Contact.findAndCountAll({
    where,
    offset: (page - 1) * limit,
    limit: Number(limit),
    order: [['created_at', 'DESC']],
  });
};

const exportToExcel = async (filters: ListParams): Promise<ExcelJS.Workbook> => {
  const { rows } = await findAll({ ...filters, limit: 10000 });
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Contacts');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 38 },
    { header: 'Full Name', key: 'fullName', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Company', key: 'company', width: 22 },
    { header: 'Message', key: 'message', width: 40 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Source', key: 'source', width: 10 },
    { header: 'Submitted At', key: 'createdAt', width: 22 },
  ];

  sheet.getRow(1).font = { bold: true };
  rows.forEach((c) => sheet.addRow(c.toJSON()));
  return workbook;
};

export const ContactService = { create, findAll, exportToExcel };
