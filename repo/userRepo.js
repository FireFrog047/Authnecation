const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
    constructor(filename) {
        if (!filename) {
            throw new Error("no file name specified");
        }
        this.filename = filename;
        try {
            fs.accessSync(this.filename);
        } catch (err) {
            fs.writeFileSync(this.filename, '[]');
        };

    }

    async getAll() {
        return JSON.parse(
            await fs.promises.readFile(this.filename, {
                encoding: 'utf8'
            })
        );
    }

    async create(attrb) {
        attrb.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex')
        const buff = await scrypt(attrb.password, salt, 64);

        const record = {
            ...attrb,
            password: `${buff.toString('hex')}.${salt}`
        };

        const records = await this.getAll();
        records.push(record);

        await this.writeAll(records);
        return record;
    }

    async comparePassword(saved, supplied) {

        const [hashed, salt] = saved.split('.');
        const suppliedBuff = await scrypt(supplied, salt, 64);

        return hashed === suppliedBuff.toString('hex');
    }

    async writeAll(records) {
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }
    randomId() {
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id) {
        const records = await this.getAll();
        return records.find(record => {
            if (record.id === id) {
                return id;
            }
        });
    }

    async delete(id) {
        const records = await this.getAll();
        const filteredRecord = records.filter(record => record.id !== id)
        await this.writeAll(filteredRecord);
    }

    async update(id, attr) {
        const records = await this.getAll();

        const newRecord = records.find(record => {
            if (record.id === id) {
                return id;
            }
        });

        Object.assign(newRecord, attr);
        await this.writeAll(records);

    }

    async getOneBy(filters) {
        const records = await this.getAll();

        for (let record of records) {
            let found = true;
            for (let key in filters) {
                if (record[key] !== filters[key]) {
                    found = false;
                }
            }
            if (found) {
                return record;
            }
        }
    }
}

module.exports = new UsersRepository('users.json');