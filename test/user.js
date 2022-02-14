// ###############################################################################
// set environment to test
process.env.NODE_ENV = 'test'

let chai = require('chai');
let chaiHttp = require('chai-http');
const { before } = require('mocha');
const { options } = require('pg/lib/defaults');
let server = require('../app')

const models = require('../models')

// Assertion style
chai.should();

chai.use(chaiHttp);
// #################################################################################


describe('User Authentication API', () => {

// before running the tests: first delete the test user if it exist in the db
before(async() => {
    await models.user.destroy({
        where: {email: "test@gmail.com"}
    })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Test signup route
describe("User Signup /signup", ()=>{
    const user = {
        email: "test@gmail.com",
        first_name: "test",
        last_name: "tester",
        password: "test123",
        phone: "07046811392"
    }

    it("It should signup a new user", (done)=>{
        chai.request(server)
        .post('/users/signup')
        .send(user)
        .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object')
            res.body.should.have.property('data')
        done()
        })
    })
});
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Test Signin route
describe("User Signin /signin", ()=>{
    const user = {
        email: "test@gmail.com",
        password: "test123"
    }

    it("It should signin the user", (done)=>{
        chai.request(server)
        .post('/users/signin')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object')
            res.body.should.have.property('token')
        done()
        })
    })
});
})
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>