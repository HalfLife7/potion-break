class UserRepository {
    constructor(dao) {
        this.dao = dao;
    }

    createTable() {
        const sql = `
        CREATE TABLE 
        IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
            steam_persona_name TEXT, 
            steam_profile_url TEXT, 
            steam_id TEXT UNIQUE, 
            steam_avatar text, 
            name TEXT, 
            email TEXT, 
            stripe_customer_id TEXT)
        `
        return this.dao.run(sql);
    }
}

module.exports = UserRepository;