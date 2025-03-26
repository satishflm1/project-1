const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, password, role }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );
      console.log('User created successfully:', { username, role });
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      console.log('Looking for user:', username);
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      console.log('User found:', rows.length > 0);
      return rows[0];
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, username, role FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  static async update(id, { username, role }) {
    const [result] = await db.execute(
      'UPDATE users SET username = ?, role = ? WHERE id = ?',
      [username, role, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async resetAdminPassword() {
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [result] = await db.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );
      console.log('Admin password reset:', result.affectedRows > 0);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error resetting admin password:', error);
      throw error;
    }
  }

  static async ensureAdminExists() {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', ['admin']);
      if (rows.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.execute(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          ['admin', hashedPassword, 'admin']
        );
        console.log('Admin user created');
        return true;
      }
      console.log('Admin user already exists');
      return false;
    } catch (error) {
      console.error('Error ensuring admin exists:', error);
      throw error;
    }
  }
}

module.exports = User; 