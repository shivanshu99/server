import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import UserModal from "../models/user.js";
import PostMessage from "../models/postMessage.js";
import { createRequire } from "module";
require("dotenv").config();
const require = createRequire(import.meta.url);
const sgMail = require("@sendgrid/mail");
const emailSenderApi =
	`${process.env.sgpass}`;
const router = express.Router();
sgMail.setApiKey(emailSenderApi);
export const getPosts = async (req, res) => {
	try {
		const postMessages = await PostMessage.find();

		res.status(200).json(postMessages);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};

export const getPost = async (req, res) => {
	const { id } = req.params;

	try {
		const post = await PostMessage.findById(id);

		res.status(200).json(post);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};

export const createPost = async (req, res) => {
	const post = req.body;

	const newPostMessage = new PostMessage({
		...post,
		creator: req.userId,
		createdAt: new Date().toISOString()
	});

	try {
		await newPostMessage.save();

		res.status(201).json(newPostMessage);
	} catch (error) {
		res.status(409).json({ message: error.message });
	}
};

export const updatePost = async (req, res) => {
	const { id } = req.params;
	const { title, message, creator, selectedFile, tags } = req.body;

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`No post with id: ${id}`);

	const updatedPost = {
		creator,
		title,
		message,
		tags,
		selectedFile,
		_id: id
	};

	await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });

	res.json(updatedPost);
};

export const deletePost = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`No post with id: ${id}`);

	await PostMessage.findByIdAndRemove(id);

	res.json({ message: "Post deleted successfully." });
};

export const likePost = async (req, res) => {
	const { id } = req.params;

	if (!req.userId) {
		return res.json({ message: "Unauthenticated" });
	}

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`No post with id: ${id}`);

	const post = await PostMessage.findById(id);

	const index = post.likes.findIndex(id => id === String(req.userId));

	if (index === -1) {
		post.likes.push(req.userId);
	} else {
		post.likes = post.likes.filter(id => id !== String(req.userId));
	}
	const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
		new: true
	});
	res.status(200).json(updatedPost);
};

export const DislikePost = async (req, res) => {
	const { id } = req.params;

	if (!req.userId) {
		return res.json({ message: "Unauthenticated" });
	}

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`No post with id: ${id}`);

	const post = await PostMessage.findById(id);

	const index = post.Dislikes.findIndex(id => id === String(req.userId));

	if (index === -1) {
		post.Dislikes.push(req.userId);
	} else {
		post.Dislikes = post.Dislikes.filter(id => id !== String(req.userId));
	}
	const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
		new: true
	});
	res.status(200).json(updatedPost);
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	var d = new Date().toString();
	var index = d.lastIndexOf(":") + 3;
	var currDate = d.substring(0, index);

	console.log(email);
	try {
		const oldUser = await UserModal.findOne({ email });

		if (!oldUser)
			return res.status(404).json({ message: "User doesn't exist" });
		else {
			const msg = {
				to: `${email}`, // Change to your recipient
				from: `tiwarishiv078@gmail.com`, // Change to your verified sender
				subject: "Password Reset",
				// text: 'That was easy!',
				html:
					"<h1>Welcome To Daily Task Report ! </h1><p>\
            <h3>Hello </h3>\
            If You are requested to reset your password then click on below link<br/>\
            <a href='http://localhost:3000/change-password/" +
					currDate +
					"+++" +
					email +
					"'>Click On This Link</a>\
            </p>"
			};
			sgMail
				.send(msg)
				.then(() => {
					console.log("Email sent");
				})
				.catch(error => {
					console.error("sssss");
				});

			return res.status(200).json({ message: "User exist" });
		}
	} catch (err) {
		res.status(500).json({ message: "Something went wrong" });
	}
};

export const updatePassword = async (req, res) => {
	const { email, password } = req.body;

	const oldUser = await UserModal.findOne({ email });

	if (!oldUser)
		return res.status(404).json({ message: "User doesn't exist" });
	let id = { _id: oldUser._id };

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(hashedPassword)
	let dataForUpdate = {
		password: hashedPassword
	};

	

	await UserModal.findOneAndUpdate(id, dataForUpdate, { new: true });

	res.json("Password Udated");
};
export default router;
