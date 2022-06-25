const joi = require("joi");
const database = require("./database");
const bcrypt = require("bcrypt");
const utility = require("../shared/utilityFunctions");


module.exports = {
    addClient: async function (req, res, next) {
        const reqBody = req.body;

        const schema = joi.object({
            id: joi.number().required().min(1).max(4000), //id defined as primary kee in database
            name: joi.string().required().min(2).max(255),
            email: joi
                .string()
                .required()
                .email()
                .regex(/^[^@]+@[^@]+$/),
            password: joi.string().required().min(6).max(255),
            type: joi.string().valid("regular", "business").default("regular"),
        });
        const {
            error,
            //value
        } = schema.validate(reqBody);

        if (error) {
            res.status(400).send(`Error adding client: ${error}`);
            console.log(error.details[0].message);
            return;
        }
        const password = await bcrypt.hash(reqBody.password, 10);

        const sqlPre = 'SELECT * FROM clients_info WHERE client_id=?;'

        try {
            const result = await database.query(sqlPre, [value.id]);
            let rows = result[0]
            if (rows.length !== 0) return res.status(409).send("Client id already in use");
        } catch (err) {
            res.status(500).send('Something went wrong');
            console.log(err.message);
        }

        const sql =
            "INSERT INTO clients_info(id, name, email, password, type)" +
            " VALUES(?,?,?,?,?);";

        try {
            const result = await database.query(sql, [
                reqBody.id,
                reqBody.name,
                reqBody.email,
                password,
                reqBody.type,
            ]);
        } catch (err) {
            console.log(`Error: ${err}`);
            res.status(500).send("Something went wrong");
            return;
        }

        res.status(200).send({
            name: reqBody.name,
            id: reqBody.id,
            status: "Client added",
        });
    },

    getClientDetails: async function (req, res, next) {
        const reqBody = req.body;
        const schema = joi.object({
            id: joi.number().required(),
        });
        const {
            error,
            value
        } = schema.validate(reqBody);
        if (error) {
            res.status(400).send(`Incorrect id: ${error}`);
            console.log(error.details[0].message);
            return;
        }
        let bodyId = value.id;
        const token = req.header("x-auth-token");
        let payload = utility.getPayload(token);
        if (payload.id != bodyId) return res.status(403).send("wrong id");

        //The need to pass id in request body can be omitted, not clear if needed from the task wording 


        const sql = "SELECT * FROM clients_info WHERE id=?;";

        try {
            const result = await database.query(sql, [payload.id]);
            let rows = result[0];

            res.status(200).json({
                id: rows[0].id,
                name: rows[0].name,
                email: rows[0].email,
                type: rows[0].type,
            });
        } catch (err) {
            console.log(`Error: ${err}`);
            res.status(500).send(`Something went wrong`);
            return;
        }
    },
    getClientCards: async function (req, res, next) {
        const schema = joi.object({
            id: joi.number().required(),
        });
        const {
            error,
            value
        } = schema.validate(req.params);

        if (error) {
            console.log(error);
            res.status(404).send(error);
            return;
        }

        const sql =
            "SELECT * FROM clients_cards WHERE client_id=? ORDER BY business_name;";

        try {
            const result = await database.query(sql, [
                [value.id]
            ]);
            res.status(200).json(rows);
        } catch (err) {
            console.log(err);
            res.status(500).send(`Something went wrong`);
        }
    },
};
