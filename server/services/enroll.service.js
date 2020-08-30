const mongoose = require("mongoose");
const userModel = require('../model/Users');

async function createUser(params) {
    let model = new userModel({ ...params });
    model.save();
    return;
}

module.exports = {
    createUser
}