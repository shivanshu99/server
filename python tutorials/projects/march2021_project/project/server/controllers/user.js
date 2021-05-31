require("dotenv").config();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModal from "../models/user.js";
import { createRequire } from "module";
import express from "express";
const require = createRequire(
    import.meta.url);

const sgMail = require("@sendgrid/mail");
const emailSenderApi = `${process.env.sgpass}`;
const router = express.Router();
sgMail.setApiKey(emailSenderApi);
const secret = "test";

export const signin = async(req, res) => {
    const { email, password } = req.body;

    try {
        const oldUser = await UserModal.findOne({ email });

        if (!oldUser)
            return res.status(404).json({ message: "User doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(
            password,
            oldUser.password
        );

        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ email: oldUser.email, id: oldUser._id },
            secret, { expiresIn: "1h" }
        );

        res.status(200).json({ result: oldUser, token });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const signup = async(req, res) => {
    const { email, password, firstName, lastName } = req.body;
    
    // console.log(vcode);
    // const verificationCode = Math.floor(100000 + Math.random() * 900000);
    try {
        const oldUser = await UserModal.findOne({ email });

        if (oldUser)
            return res.status(400).json({ message: "User already exists" });
        else {
            // const msg = {
            //     to: `${email}`, // Change to your recipient
            //     from: `tiwarishiv078@gmail.com`, // Change to your verified sender
            //     subject: "Verification Code",
            //     // text: 'That was easy!',
            //     html: `<h3>Your Verification Code is </h3><p>\
            // <h3>${verificationCode}</h3>`
            // };
            // sgMail
            //     .send(msg)
            //     .then(() => {
            //         alert("Verification Code is sended on Your mail");
            //     })
            //     .catch(error => {
            //         console.error(error);
            //     });

            // console.log(vcode);
            const hashedPassword = await bcrypt.hash(password, 12);

            const result = await UserModal.create({
                email,
                password: hashedPassword,
                name: `${firstName} ${lastName}`
            });

            const token = jwt.sign({ email: result.email, id: result._id },
                secret, { expiresIn: "1h" }
            );

            res.status(201).json({ result, token });
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

        console.log(error);
    }
};