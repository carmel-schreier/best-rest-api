const jwt = require("jsonwebtoken");
const config = require("../config/dev");
const joi = require("joi");
const database = require("./database");
const bcrypt = require("bcrypt");

module.exports = {
    login: async function (req, res, next) {
        const reqBody = req.body;
        const schema = joi.object({
            email: joi.string().required().min(6).max(255).email(),
            password: joi.string().required().min(6),
        });

        const {
            error,
            value
        } = schema.validate(reqBody);

        if (error) {
            console.log(error.details[0].message);
            res.status(401).send("Unauthorized");
            return;
        }

        const sql = "SELECT * FROM clients_info WHERE email=?;";

        try {
            const result = await database.query(sql, [reqBody.email]);
            const rows = result[0];
            console.log(rows);
            const validPassword = await bcrypt.compare(
                reqBody.password,
                rows[0].password
            );
            if (!validPassword) throw "Invalid email or password";

            const param = {
                id: rows[0].id,
            };
            const token = jwt.sign(param, config.JWT_SECRET, {
                expiresIn: "72800s",
            });

            res.status(200).json({
                id: rows[0].id,
                name: rows[0].name,
                email: rows[0].email,
                type: rows[0].type,
                token: token,
            });
        } catch (err) {
            console.log(`Error: ${err}`);
            res.status(401).send("Unauthorized");
            return;
        }
    },
};