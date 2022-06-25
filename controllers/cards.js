const joi = require('joi');
const database = require('./database');

module.exports = {

    addCard: async function (req, res, next) {
        const reqBody = req.body;
        const schema = joi.object({
            client_id: joi.number().required().min(1),
            business_name: joi.string().required().min(2).max(255),
            description: joi.string().min(2).max(500),
            phone: joi.string().required().regex(/^[0-9]{8,12}$/),
            address: joi.string().min(4).max(255),
            photo: joi.string().min(10).max(255),
            //card_id defined as auto-increment
        });
        const {
            error,
            value
        } = schema.validate(reqBody);

        if (error) {
            res.status(400).send(`Error adding business card: ${error}`);
            console.log(error.details[0].message);
            return;
        }

        const sqlPre = 'SELECT * FROM clients_info WHERE id=?;'

        try {
            const result = await database.query(sqlPre, [reqBody.client_id]);
            let rows = result[0]
            if (rows.length === 0) return res.status(400).send("Wrong client id");
        } catch (err) {
            res.status(500).send('Something went wrong');
            console.log(err);
        }

        const sql =
            "INSERT INTO clients_cards(business_name,description, phone, address, photo,client_id)" +
            " VALUES(?,?,?,?,?,?);";

        try {
            const result = await database.query(
                sql,
                [
                    reqBody.business_name,
                    reqBody.description,
                    reqBody.phone,
                    reqBody.address,
                    reqBody.photo,
                    reqBody.client_id,
                ]
            );
        } catch (err) {
            console.log(`Error: ${err}`)
            res.status(500).send('Something went wrong');
            //in case there is no matching client_id in the database 
            return;
        }
        res.status(200).json(reqBody)
    },

    getCard: async function (req, res, next) {

        const schema = joi.object({
            id: joi.number().required()
        })
        const {
            error,
            value
        } = schema.validate(req.params);

        if (error) {
            res.status(400).send(`Wrong request: ${error}`);
            console.log(error.details[0].message);
            return;
        }

        const sql = 'SELECT * FROM clients_cards WHERE card_id=?;';

        try {
            const result = await database.query(sql, [value.id]);
            let rows = result[0]
            if (rows[0] === undefined) return res.status(404).send("Card not found");
            res.status(200)
                .json({
                    client_id: rows[0].client_id,
                    business_name: rows[0].business_name,
                    description: rows[0].description,
                    address: rows[0].address,
                    phone: rows[0].phone,
                    photo: rows[0].photo,
                })

        } catch (err) {
            console.log(err.message);
            res.status(500).send('Something went wrong');
            return;
        }
    },

    editCard: async function (req, res, next) {

        const reqBody = req.body;

        const schema = joi.object({
            //card_id: joi.number().required().min(1).max(11),
            client_id: joi.number().min(1).max(4000),
            business_name: joi.string().min(2).max(200),
            description: joi.string().min(2).max(300),
            phone: joi.string().regex(/^[0-9]{8,12}$/),
            address: joi.string().min(4).max(300),
            photo: joi.string().min(10).max(200),
        }).min(1);

        const {
            error,
            value
        } = schema.validate(reqBody);

        if (error) {
            console.log(`Error: ${error}`);
            res.status(400).send(`Error updating card: ${error}`);
            return;
        }
        const keys = Object.keys(value);
        const values = Object.values(value);
        const fields = keys.map(key => `${key}=?`).join(',');
        values.push(req.params.id);

        const sqlPre = 'SELECT * FROM clients_cards WHERE card_id=?;'

        try {
            const result = await database.query(sqlPre, [req.params.id]);
            let rows = result[0]
            if (rows[0] === undefined) return res.status(404).send("Card not found");

        } catch (err) {
            res.status(500).send('Something went wrong');
            console.log(err.message);
        }

        const sql = `UPDATE clients_cards SET ${fields} WHERE card_id=?`;
        try {
            const result = await database.query(sql, values);
            res.status(200).send(`Card #${req.params.id} updated`);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Something went wrong');
        }

    },

    deleteCard: async function (req, res, next) {

        const schema = joi.object({
            id: joi.number().required()
        })
        const {
            error,
            value
        } = schema.validate(req.params);

        if (error) {
            res.status(400).send('error ${error}');
            console.log(error.details[0].message);
            return;
        }

        const sqlPre = 'SELECT * FROM clients_cards WHERE card_id=?;'

        try {
            const result = await database.query(sqlPre, [value.id]);
            let rows = result[0]
            if (rows[0] === undefined) return res.status(404).send("Card not found");
        } catch (err) {
            res.status(500).send('Something went wrong');
            console.log(err.message);
        }

        const sql = `DELETE FROM clients_cards WHERE card_id=?`;

        try {
            const result = await database.query(sql, [value.id]);
            res.status(200).send(`Card #${value.id} successfully deleted`)
        } catch (err) {
            res.status(500).send('Something went wrong');
            console.log(err.message);
        }
    },



}
