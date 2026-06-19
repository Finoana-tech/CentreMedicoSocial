const bcrypt = require('bcryptjs');
const saltRounds = 12;

const hashPassword = async (plainPassword) => {
    return await bcrypt.hash(plainPassword, saltRounds);
};

const comparePasswords = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { hashPassword, comparePasswords };