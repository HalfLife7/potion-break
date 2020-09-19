class UserGamesRepository {
    constructor(dao) {
        this.dao = dao;
    }

    createTable() {
        const sql = `
        CREATE TABLE 
        IF NOT EXISTS user_games_owned (
            app_id INTEGER, 
            user_id INTEGER, 
            playtime_forever INTEGER, 
            potion_break_active TEXT,
            PRIMARY KEY(app_id, user_id), 
            FOREIGN KEY(app_id) REFERENCES games(app_id), 
            FOREIGN KEY(user_id) REFERENCES users(user_id))
        `
        return this.dao.run(sql);
    }
}

module.exports = UserGamesRepository;