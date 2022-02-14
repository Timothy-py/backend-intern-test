const models = require('../models');
const bcrypt = require('bcrypt');
const {body, validationResult} = require('express-validator');

// handle user signup
exports.signup = [
    // execute validator function
    validator(),

    async (req, res) => {
        // check for validations
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(422).json({
                errors: errors.array()
            })
        }

        // destructure request body
        const {
        first_name,
        last_name,
        email,
        password,
        phone
        } = req.body

        // check if user exist in the DB: If YES abort signup ELSE continue
        let user = await models.user.findOne({
            where: {email: email}
        })
        if(user){
            res.status(409).json({
                message: "User already exist",
                status: false
            })
        }

        // Encrypt the user password
        const saltRound = 10
        const salt = await bcrypt.genSalt(saltRound)
        const encryptedPassword = await bcrypt.hash(password, salt)

        // create new user
        await models.user.create({
            email: email,
            password: encryptedPassword,
            first_name: first_name,
            last_name: last_name,
            phone: phone
        })
            .then((new_user) => {
                res.status(201).json({
                    message: "User created successfully",
                    status: true,
                    data: new_user
                })
            })
            .catch((error) => {
                res.status(500).json({
                    message: error.message,
                    status: false
                })
            })
    }
]

// validator function to validate request body object
function validator(){
    return[
        body('first_name')
        .notEmpty().withMessage("first_name cannot be empty"),

        body('last_name')
        .notEmpty().withMessage("last_name cannot be empty"),

        body('email')
        .notEmpty().withMessage("email cannot be empty")
        .isEmail().normalizeEmail().withMessage("Not a valid email address"),

        body('password')
        .notEmpty().withMessage("password cannot be empty")
        .isLength({
            min: 6
        }).withMessage("Password too short"),

        body('phone')
        .notEmpty().withMessage("phone cannot be empty")
        .isMobilePhone().withMessage("Not a valid phone number")
    ]
}