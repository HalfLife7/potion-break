class PotionBreakRepository {
    constructor(dao) {
        this.dao = dao;
    }

    createTable() {
        const sql = `
        CREATE TABLE 
        IF NOT EXISTS potion_breaks (
            potion_break_id INTEGER PRIMARY KEY AUTOINCREMENT, 
            start_date TEXT, 
            end_date TEXT, 
            user_id INTEGER, 
            app_id INTEGER, 
            total_value INTEGER, 
            charity_id INTEGER, 
            setup_intent_id TEXT, 
            status TEXT, 
            playtime_start TEXT, 
            playtime_end TEXT, 
            payment_status TEXT, 
            stripe_payment_date_created TEXT, 
            FOREIGN KEY(app_id) REFERENCES games(app_id), 
            FOREIGN KEY(user_id) REFERENCES users(user_id), 
            FOREIGN KEY(charity_id) REFERENCES charities(charity_id))
        `
        return this.dao.run(sql);
    }
}

module.exports = PotionBreakRepository;