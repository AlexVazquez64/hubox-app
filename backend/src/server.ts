import 'dotenv/config';
import app from './app.js';
import { sequelize } from './config/database.js';

const PORT = process.env.PORT || 4000;

(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
})();
