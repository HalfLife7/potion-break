class CharityRepository {
    constructor(dao) {
        this.dao = dao;
    }

    createTable() {
        const sql = `
        CREATE TABLE 
        IF NOT EXISTS charities (
            charity_id INTEGER PRIMARY KEY, 
            name TEXT UNIQUE, 
            description TEXT, 
            img_path TEXT)
        `
        return this.dao.run(sql);
    }
}

module.exports = CharityRepository;