const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function setupTables() {
    try {
        console.log('Setting up tables...');
        
        // Read the SQL file
        const sql = fs.readFileSync(
            path.join(__dirname, '../database/create-tables.sql'),
            'utf8'
        );

        // Split the SQL into individual commands
        const commands = sql
            .split(';')
            .filter(cmd => cmd.trim())
            .map(cmd => cmd.trim() + ';');

        // Execute each command
        for (const command of commands) {
            await db.query(command);
        }

        console.log('✅ Tables set up successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up tables:', error);
        process.exit(1);
    }
}

setupTables(); 