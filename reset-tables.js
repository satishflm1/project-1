const db = require('./config/database');

async function resetTables() {
    try {
        console.log('Attempting to reset tables...');
        
        // Reset all tables to available
        const [result] = await db.query('UPDATE tables SET status = "available"');
        console.log('Update query executed. Affected rows:', result.affectedRows);
        
        // Verify the update
        const [tables] = await db.query('SELECT * FROM tables ORDER BY table_number');
        console.log('Current table statuses:', tables);

        // Wait a bit before exiting to ensure the connection pool has time to process
        setTimeout(() => {
            console.log('Tables reset completed successfully');
            process.exit(0);
        }, 1000);
    } catch (error) {
        console.error('Error resetting tables:', error);
        process.exit(1);
    }
}

// Execute the reset
resetTables(); 