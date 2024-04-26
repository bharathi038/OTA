const db = require('../config/db');
const { tables } = require('../config/config');
const bcrypt = require("bcrypt");

class UserModel {
    constructor() {

    }

    async hashedPassword(str){
        return await bcrypt.hash(str, await bcrypt.genSalt(10));
    }

    async register(data) {
        let userDetails = {
            'name': data.name,
            'email_id': data.emailId,
            'password': await this.hashedPassword(data.password),
            'mobileno': data.mobileNo,
            'created_date': Date.now()
        };

        let inserted = await db(tables.users).insert(userDetails);
        return inserted.length ? inserted[0] : false;
    }

    async getUserByUserId(userId) {
        let query = await db(tables.users).select({ 'userId': 'id', 'emailId': 'email_id', 'name': 'name', 'mobileNo': 'mobileno' }).where({ 'id': userId }).limit(1);
        return query.length ? query[0] : false;
    }

    async getUserByEmailId(emailId) {
        let query = await db(tables.users).select({ 'userId': 'id', 'emailId': 'email_id', 'name': 'name', 'mobileNo': 'mobileno' }).where({ 'email_id': emailId }).limit(1);
        return query.length ? query[0] : false;
    }

    async isEmailIdExists(emailId) {
        let query = await db(tables.users).select({ 'userId': 'id'}).where({ 'email_id': emailId }).limit(1);
        return query.length;
    }

    async isMobileNoExists(mobileNo) {
        let query = await db(tables.users).select({ 'userId': 'id'}).where({ 'mobileno': mobileNo }).limit(1);
        return query.length;
    }

    async isValidUserCredentials(emailId, password) {
        let query = await db(tables.users).select({ 'userId': 'id', 'emailId': 'email_id', 'password': 'password' }).where({ 'email_id': emailId }).limit(1);
        if(!query.length){
            return false;
        }
        return bcrypt.compare(password, query[0].password)
    }

    async storeInSession(data) {
        let sessionDetails = {
            'user_id': data.userId,
            'token': data.token,
            'expires': data.expires
        };

        let inserted = await db(tables.session).insert(sessionDetails);
        return inserted;
    }

    async removeOldSession(data) {
        let isDeleted = await db(tables.session).where({user_id:data.userId}).where("expires","<", data.now).del();
        return isDeleted;
    }

    async removeASession(data) {
        let isDeleted = await db(tables.session).where({user_id:data.userId, token:data.token}).del();
        return isDeleted;
    }

    async isSessionValid(data) {
        let timeNow = Math.floor(Date.now()/1000)
       let query = await db(tables.session).where({user_id:data.userId, token:data.token}).limit(1);
       if(!query.length || query[0].expires < timeNow){
        return false;
       }
     
       return true;
    }



}

let userModel = new UserModel();
module.exports = userModel;