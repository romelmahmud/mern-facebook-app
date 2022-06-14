const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../config/validate");
const bcrypt = require("bcrypt");
const generateToken = require("../config/token");
const sentVerificationEmail = require("../config/mailer");

/*
 * ##### User Registration Controller #####
 */

const registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    //   validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalide email address",
      });
    }

    //   checking existing email
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({
        message: "email address already exist",
      });
    }

    //   validate input length
    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "first name must be between 3 to 30 characters",
      });
    }

    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: "last name must be between 3 to 30 characters",
      });
    }

    if (!validateLength(password, 6, 40)) {
      return res.status(400).json({
        message: "password must be atleast 6 characters",
      });
    }

    //   hashing password
    const hashedPassword = await bcrypt.hash(password, 12);

    //   validate username
    let tempUsername = first_name + last_name;
    const newUsername = await validateUsername(tempUsername);

    //   create user
    const user = await new User({
      first_name,
      last_name,
      username: newUsername,
      email,
      password: hashedPassword,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();

    // varification token creation
    const emailVarificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );

    const url = `${process.env.BASE_URL}/activate/${emailVarificationToken}`;

    sentVerificationEmail(user.email, user.first_name, url);

    const token = generateToken({ id: user._id.toString() }, "7d");

    res.status(200).send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token,
      verified: user.verified,
      message: "Registration Successfull, please activate your email to start",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
 * ##### Activate User Controller #####
 */

const activateAccount = async (req, res) => {
  try {
    const { token } = req.body;
    const user = jwt.verify(token, process.env.JWT_TOKEN);

    const check = await User.findById(user.id);
    if (check.verified) {
      return res.status(400).json({
        message: "Account already activated",
      });
    } else {
      await User.findByIdAndUpdate(user.id, {
        verified: true,
      });
      return res.status(200).json({
        message: "Account activated successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
 * #####  User Login Controller #####
 */

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalide Credentials",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Invalide Credentials",
      });
    }

    const token = generateToken({ id: user._id.toString() }, "7d");

    res.status(200).send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token,
      verified: user.verified,
      message: "Registration Successfull, please activate your email to start",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, activateAccount, loginUser };
