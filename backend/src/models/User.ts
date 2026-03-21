import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface UserAttributes {
  id: string;
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'admin' | 'viewer';
  lastLoginAt?: Date;
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  'id' | 'avatarUrl' | 'lastLoginAt' | 'role'
> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare googleId: string;
  declare email: string;
  declare displayName: string;
  declare avatarUrl?: string;
  declare role: 'admin' | 'viewer';
  declare lastLoginAt?: Date;
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    googleId: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    displayName: { type: DataTypes.STRING(150), allowNull: false },
    avatarUrl: { type: DataTypes.STRING(500), allowNull: true },
    role: { type: DataTypes.ENUM('admin', 'viewer'), defaultValue: 'viewer' },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;
