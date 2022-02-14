const models = require('../models');
const bcrypt = require('bcrypt');
const {body, validationResult} = require('express-validator');

// import utility
const jwtGenerator = require('../utils/jwtGenerator')

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
            return res.status(409).json({
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

// handle user signin
exports.signin = async (req, res) => {
    try {
        // destructure request body
        const {email, password} = req.body

        // validate user and password field is not empty
        if(!email || !password){
            return res.status(400).json({
                message: "Email/Password field cannot be empty",
                status: false
            })
        }

        // check if user exist: if YES continue signup ELSE abort
        let user = await models.user.findOne({
            where: {email: email}
        })
        if(!user){
            return res.status(401).json({
                message: "User does not exist",
                status: false
            })
        };

        // validate user password
        const validPassword = await bcrypt.compare(password, user.password);

        // if user password is incorrect
        if(!validPassword){
           return res.status(401).json({
                message: "Incorrect Password",
                status: false
            })
        };

        // generate jwt for user
        const token = jwtGenerator(user.id)

        return res.status(200).json({
            message: `Logged in successfully as ${user.email}`,
            status: true,
            token: token
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message || "Internal server error"
        })
    }
}

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