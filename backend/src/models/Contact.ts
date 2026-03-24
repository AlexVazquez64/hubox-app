import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface ContactAttributes {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: 'web' | 'api' | 'import';
  status: 'new' | 'contacted' | 'archived';
  ipAddress?: string;
}

interface ContactCreationAttributes extends Optional<
  ContactAttributes,
  'id' | 'phone' | 'company' | 'ipAddress'
> { }

class Contact
  extends Model<ContactAttributes, ContactCreationAttributes>
  implements ContactAttributes {
  declare id: string;
  declare fullName: string;
  declare email: string;
  declare phone?: string;
  declare company?: string;
  declare message: string;
  declare source: 'web' | 'api' | 'import';
  declare status: 'new' | 'contacted' | 'archived';
  declare ipAddress?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Contact.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fullName: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  company: { type: DataTypes.STRING(150), allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  source: { type: DataTypes.ENUM('web', 'api', 'import'), defaultValue: 'web' },
  status: { type: DataTypes.ENUM('new', 'contacted', 'archived'), defaultValue: 'new' },
  ipAddress: { type: DataTypes.STRING(45), allowNull: true },
}, {
  sequelize,
  tableName: 'contacts',
});

export default Contact;
