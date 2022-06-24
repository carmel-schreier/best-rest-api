const joi = require("joi");
const database = require("./database");
const bcrypt = require("bcrypt");
const utility = require("../shared/utilityFunctions");
//const fileMgmt = require('../shared/fileMgmt');

module.exports = {
    addClient: async function (req, res, next) {
        const reqBody = req.body;

        // להעביר ולראות איזה תנאי צריך

        const schema = joi.object({
            id: joi.number().required().min(1).max(4000),
            name: joi.string().required().min(2).max(100),
            email: joi
                .string()
                .required()
                .email()
                .regex(/^[^@]+@[^@]+$/),
            password: joi.string().required().min(6).max(30),
            type: joi.string().valid("regular", "business").default("regular"),
        });
        const {
            error,
            //value
        } = schema.validate(reqBody);

        if (error) {
            res.status(400).send(`error adding client: ${error}`);
            console.log(error.details[0].message);
            return;
        }
        const password = await bcrypt.hash(reqBody.password, 10);

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
            res.status(401).send("Failed to add client");
            return;
        }
        console.log("reqBody = " + reqBody);
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
        } = schema.validate(reqBody.id);

        let routId = value.id;
        const token = req.header("x-auth-token");
        let payload = utility.getPayload(token);
        if (payload.id != routId) return res.status(401).send("Wrong id");

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
            res.status(400).send("No match for your request");
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
            res.status(400).send("Not found");
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
            res.send(err);
        }
    },
};