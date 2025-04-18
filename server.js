const express = require("express");
const nodemailer = require("nodemailer");
const CryptoJS = require("crypto-js");
const Joi = require("joi");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const cors = require("cors");
//for nodemailer
const { error } = require("console");
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;

const uri = "mongodb://localhost:27017";

const secretKey = "secretkey_16byte";
let client;
async function connect() {
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

const headerSchema = Joi.object({
  authorization: Joi.string()
    .pattern(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
    .required(),
}).unknown(true);

app.post("/leadprofile", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token:", token);
    console.log("Headers:", req.headers);

    const decoded = jwt.verify(token, SECRET_KEY);

    const client = await connect();
    const userCol = client.db("Rencoders").collection("leadinfo");

    const lead = await userCol.findOne({
      email: decoded.email,
    });
    if (!lead) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    console.log("fetch err", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "failed to display profile" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//display student details
app.post("/studentdata", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    const client = await connect();
    const userCol = client.db("Rencoders").collection("studentinfo");

    const lead = await userCol.find().sort({ _id: -1 }).toArray();
    res.status(200).json(lead);
  } catch (error) {
    console.log("fetch err", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//display leads in admin
const bodySchema = Joi.object({
  roal: Joi.string().valid("lead").required(),
});
app.post("/leaddata", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const { error: bodyError } = bodySchema.validate(req.body);
    if (bodyError) {
      return res.status(400).json({ message: bodyError.details[0].message });
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    const client = await connect();
    const userCol = client.db("Rencoders").collection("leadinfo");
    // const { roal } = req.body;

    let leadData = await userCol.find({ roal: "lead" }).toArray();

    if (leadData.length === 0) {
      return res.status(404).json({ message: "No leads found" });
    }
   // console.log("leaddata", leadData);
    res.status(200).json({ message: "Data fetched successfully", leadData });
  } catch (error) {
    console.log("fetch err", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});
//add student
const addbodySchema = Joi.object({
  leadId: Joi.string().trim().required().messages({
    "string.empty": "Lead ID is required",
  }),
  studentId: Joi.string().trim().required().messages({
    "string.empty": "Student ID is required",
  }),
  firstName: Joi.string().trim().required().messages({
    "string.empty": "First name is required",
  }),
  lastName: Joi.string().trim().required().messages({
    "string.empty": "Last name is required",
  }),
  dob: Joi.date().iso().required().messages({
    "date.base": "Date of Birth must be a valid date",
    "date.format": "Date of Birth must be in ISO format (YYYY-MM-DD)",
    "any.required": "Date of Birth is required",
  }),
  address: Joi.string().trim().required().messages({
    "string.empty": "Address is required",
  }),
  selectedCourse: Joi.string().trim().required().messages({
    "string.empty": "Selected course is required",
  }),
  paymentStatus: Joi.string().trim().required().messages({
    "string.empty": "Payment status is required",
  }),
  learningMode: Joi.string().trim().required().messages({
    "string.empty": "Learning mode is required",
  }),
  sourceType: Joi.string().trim().allow("").optional(),
  referralSource: Joi.string().trim().allow("").optional(),
  currentStatus: Joi.string().trim().allow("").optional(),
});

//add student by admin
app.post("/addbyadmin", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { value: validatedBody, error: bodyError } = addbodySchema.validate(
      req.body,
      { stripUnknown: true }
    );
    if (bodyError) {
      return res.status(400).json({ error: bodyError.details[0].message });
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    const client = await connect();
    const userCol = client.db("Rencoders").collection("studentinfo");

    console.log("add api validation...", validatedBody);
    const user = await userCol.findOne({ studentId: validatedBody.studentId });
    console.log(" add user id", user);
    if (user) {
      return res.status(401).json({ error: "student ID already exist" });
    }

    await userCol.insertOne(validatedBody);
    res.status(201).json({ message: " add successfully" });
  } catch (error) {
    console.error("failed to add:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//verify password
const verifybodySchema = Joi.object({
  enoldPassword: Joi.string().required().messages({
    "string.empty": "Old password is required",
  }),
}).required();

app.post("/verify-password", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({
        error: headerError.details[0]?.message || "Invalid headers",
      });
    }

    const { value: validatedBody, error: bodyError } =
      verifybodySchema.validate(req.body);
    if (bodyError) {
      return res
        .status(400)
        .json({ error: bodyError.details[0]?.message || "Invalid request" });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    const client = await connect();
    const userCol = client.db("Rencoders").collection("leadinfo");

    const { enoldPassword } = validatedBody;
    console.log("enoldPassword:", enoldPassword);

    const user = await userCol.findOne({ password: enoldPassword });
    // console.log("usersssss", user);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (enoldPassword !== user.password) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }
    return res.json({ success: true });
  } catch (error) {
    console.log("fetch err", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//update password
const passwordSchema = Joi.object({
  enoldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
    "string.empty": "Old password cannot be empty",
  }),
  ennewPassword: Joi.string().required().messages({
    "any.required": "New password is required",
    "string.empty": "New password cannot be empty",
  }),
}).required();

app.post("/newpassword", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res
        .status(400)
        .json({ error: headerError.details[0]?.message || "Invalid headers" });
    }

    const { value: validatedBody, error: bodyError } = passwordSchema.validate(
      req.body
    );
    if (bodyError) {
      return res
        .status(400)
        .json({ error: bodyError.details[0]?.message || "Invalid request" });
    }

    const { enoldPassword, ennewPassword } = validatedBody;

    if (enoldPassword === ennewPassword) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the old password" });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const client = await connect();
    const userCol = client.db("Rencoders").collection("leadinfo");

    console.log("Old Password:", enoldPassword);
    console.log("newpassword", ennewPassword);

    const user = await userCol.findOne({ password: enoldPassword });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Old password is incorrect" });
    }

    const result = await userCol.updateOne(
      { password: enoldPassword },
      { $set: { password: ennewPassword } }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Password update failed" });
    }
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Failed to update new password:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//update lead details

const updateLeadSchema = Joi.object({
  Id: Joi.string().required().messages({
    "any.required": "Lead ID is required",
    "string.empty": "Lead ID cannot be empty",
  }),
  firstname: Joi.string().required().messages({
    "any.required": "First name is required",
    "string.empty": "First name cannot be empty",
  }),
  lastname: Joi.string().required().messages({
    "any.required": "Last name is required",
    "string.empty": "Last name cannot be empty",
  }),
  dob: Joi.string().required().messages({
    "any.required": "Date of Birth is required",
    "string.empty": "DOB cannot be empty",
  }),
  phoneNo: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  address: Joi.string().required().messages({
    "any.required": "Address is required",
    "string.empty": "Address cannot be empty",
  }),
  image: Joi.string().allow("").optional(),
  status: Joi.string().required().messages({
    "any.required": "Status is required",
    "string.empty": "Status cannot be empty",
  }),
});

app.post("/updatelead", async (req, res) => {
  const { error: headerError } = headerSchema.validate(req.headers);
  if (headerError) {
    return res
      .status(400)
      .json({ error: headerError.details[0]?.message || "Invalid headers" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authorization token missing" });
  }
  const { error: bodyError, value: validatedBody } = updateLeadSchema.validate(
    req.body
  );
  if (bodyError) {
    return res
      .status(400)
      .json({ error: bodyError.details[0]?.message || "Invalid request body" });
  }

  const {
    Id,
    firstname,
    lastname,
    dob,
    phoneNo,
    email,
    password,
    address,
    image,
    status,
  } = validatedBody;

  const decoded = jwt.verify(token, SECRET_KEY);
  const client = await connect();
  const userCol = client.db("Rencoders").collection("leadinfo");

  try {
    const encryptedmail = encryptData(email);
    const encryptedPassword = encryptData(password);

    const updatedLead = await userCol.findOneAndUpdate(
      { Id },
      {
        $set: {
          firstname,
          lastname,
          dob,
          phoneNo,
          email: encryptedmail,
          password: encryptedPassword,
          address,
          image,
          status,
        },
      }
    );

    if (!updatedLead) {
      console.log("lead not found");
      return res.status(404).json({ message: "Lead not found" });
    }

    console.log("updatedddd", updatedLead);
    res.status(200).json({ message: "Lead updated successfully", updatedLead });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Error updating lead", error });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//count of lead
const countLeadSchema = Joi.object({
  roal: Joi.string().valid("lead").required(),
});
app.post("/countlead", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res
        .status(400)
        .json({ error: headerError.details[0]?.message || "Invalid headers" });
    }

    const { error: bodyError, value } = countLeadSchema.validate(req.body);
    if (bodyError) {
      return res.status(400).json({
        success: false,
        message: bodyError.details[0]?.message || "Invalid request body",
      });
    }

    const { roal } = value;
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    const client = await connect();
    const userCol = client.db("Rencoders").collection("leadinfo");

    const count = await userCol.countDocuments();
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//leads student
app.post("/leadstudent", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res
        .status(400)
        .json({ error: error.details[0]?.message || "Invalid headers" });
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const client = await connect();
    const userCol = client.db("Rencoders").collection("studentinfo");

    const { leadId } = req.body;

    if (!leadId) {
      return res
        .status(400)
        .json({ success: false, message: "Lead ID is required" });
    }
    const user = await userCol.find({ leadId: leadId }).toArray();
    if (!user.length)
      return res
        .status(404)
        .json({ success: false, message: "student not found for this lead" });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//update student

const updateStudentSchema = Joi.object({
  studentId: Joi.string().required().messages({
    "any.required": "studentId is required",
    "string.base": "studentId must be a string",
  }),
  sourceType: Joi.string().messages({
    "string.base": "sourceType must be a string",
  }),
  referralSource: Joi.string().messages({
    "string.base": "referralSource must be a string",
  }),
  currentStatus: Joi.string().messages({
    "string.base": "currentStatus must be a string",
  }),
});

app.post("/updatestudent", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res
        .status(400)
        .json({ error: headerError.details[0]?.message || "Invalid headers" });
    }

    const { error: bodyError, value } = updateStudentSchema.validate(req.body);
    if (bodyError) {
      return res.status(400).json({
        success: false,
        message: bodyError.details[0]?.message || "Invalid request body",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    console.log("got apiiii");

    const client = await connect();
    const userCol = client.db("Rencoders").collection("studentinfo");

    const { studentId, sourceType, referralSource, currentStatus } = value;
    console.log("value", value);

    const updatedstud = await userCol.findOneAndUpdate(
      { studentId },
      {
        $set: {
          sourceType,
          referralSource,
          currentStatus,
        },
      }
    );

    if (!updatedstud) {
      console.log("studnet not found");
      return res.status(404).json({ message: "student not found" });
    }

    console.log("updatedddd", updatedstud);
    res.status(200).json({
      message: "student updated successfully",
      // updatedstud: updatedstud.value,
      updatedstud,
    });
  } catch (error) {
    console.error("Error:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//generat otp
//hkfw pjdl gatn yjmt

let generatedOtp = null;
let otpStore = {};

const encryptData = (text) => {
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.enc.Utf8.parse("fixed16byteIV_");
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

const otpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  roal: Joi.string().valid("admin", "lead").required().messages({
    "string.empty": "Role is required",
  }),
});

app.post("/send-otp", async (req, res) => {
  try {
    const { error, value } = otpSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { email, roal } = value;

    const client = await connect();
    const userCol = client.db("Rencoders").collection("leadinfo");

    const encryptedEmail = encryptData(email.toLowerCase());
    console.log("login email:", email, "role:", roal);
    console.log("encrypted mail:", encryptedEmail);
    const user = await userCol.findOne({ email: encryptedEmail, roal });

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    console.log("login user::", user);
    generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = Date.now() + 5 * 60 * 1000;

    otpStore[email] = { otp: generatedOtp, expiresAt: expiryTime };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: ' "Rencoders Academy" <${process.env.EMAIL_USER}>',
      to: email,
      subject: "Please verify your device",
      text: `Hey!!
       
A sign in attempt requires further verification because we did not recognize your device. To complete the sign in, enter the verification code on the unrecognized device.

Verification code: ${generatedOtp}

This OTP is valid for 5 minutes only.`,
    };

    await transporter.sendMail(mailOptions);

    res.send({ success: true, message: "OTP sent" });
    console.log(`current OTP code  ${generatedOtp}  expiryTime ${expiryTime}`);
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Failed to send OTP" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Enter a valid email",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits",
  }),
  roal: Joi.string().required().messages({
    "string.empty": "Role is required",
  }),
});
app.post("/verify-otp", async (req, res) => {
  try {
    const { error, value } = verifyOtpSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    const { email, otp, roal } = value;
    const stored = otpStore[email];

    if (!stored) {
      return res
        .status(400)
        .send({ success: false, message: "No OTP sent. verify entered email" });
    }

    if (Date.now() > stored.expiresAt) {
      delete otpStore[email];
      return res.status(400).send({ success: false, message: "OTP expired" });
    }
    if (otp !== stored.otp) {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    delete otpStore[email];

    const client = await connect();
    const userCol = client.db("Rencoders").collection("leadinfo");

    const encryptedEmail = encryptData(email.toLowerCase());
    const user = await userCol.findOne({ email: encryptedEmail, roal });

    const token = jwt.sign(
      { roal: user.roal, Id: user.Id, email: user.email, name: user.firstname },
      SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    console.log("token backend", token);
    const decoded = jwt.verify(token, SECRET_KEY);
    const sentId = decoded.Id;
    const sentName = decoded.name;
    const sentrole = decoded.roal;
    console.log("token data from verify", sentId, sentName, sentrole);
    res.send({ success: true, message: "OTP verified", token, user });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//reassign student
app.post("/reassign-students", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    const { leadId, studentIds } = req.body;

    if (!leadId || studentIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Lead ID and student IDs are required." });
    }

    const client = await connect();
    const studentCol = client.db("Rencoders").collection("studentinfo");

    const updateResult = await studentCol.updateMany(
      { studentId: { $in: studentIds } }, 
      { $set: { leadId: leadId } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ message: "No students were updated. " });
    }

    res.status(200).json({ message: "Students reassigned successfully." });
  } catch (error) {
    console.error("Error on reassigning ", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//update full student data
const studentSchema = Joi.object({
  studentId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dob: Joi.string().required(),
  address: Joi.string().required(),
  selectedCourse: Joi.string().required(),
  learningMode: Joi.string().required(),
  sourceType: Joi.string(),
  referralSource: Joi.string(),
  currentStatus: Joi.string(),
  paymentStatus: Joi.string().required(),
}).unknown(true);

app.post("/studentupdate", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }
    const { error, value } = studentSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const decoded = jwt.verify(token, SECRET_KEY);

    const client = await connect();
    const userCol = client.db("Rencoders").collection("studentinfo");

    const data = { ...value };
    delete data._id;
    const result = await userCol.updateOne(
      { studentId: data.studentId },
      { $set: data }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: "Student updated successfully" });
    } else {
      res.status(404).json({ message: "Student not found or data unchanged" });
    }
  } catch (err) {
    console.error(err);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
    res.status(500).json({ message: "Database error" });
  }
});



//createticket
app.post("/createticket", async (req, res) => {
  let client;
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    const createdById = decoded.Id;
    const createdByName = decoded.name;
    const createdByRole = decoded.roal;

    const { gotName, gotcontent } = req.body;
    if (!gotName || !gotcontent) {
      return res
        .status(400)
        .json({ error: "Both fields are required." });
    }

    const ticketId = Math.floor(100000 + Math.random() * 900000).toString();

    client = await connect();
    const ticketCol = client.db("Rencoders").collection("Tickets");

    const initialMessage = {
      senderId: createdById,
      senderRole: createdByRole,
      senderName: createdByName,
      assignedTo:gotName,
      content: gotcontent,
      timestamp: new Date().toISOString(),
    };

    const newTicket = {
      ticketId,
      createdBy: createdById,
      assignedTo: gotName,
      update: "open",
      messages: [initialMessage],
    };

    await ticketCol.insertOne(newTicket);

    return res
      .status(201)
      .json({ message: "New ticket created successfully", ticketId });
  } catch (error) {
    console.error("Error in /createticket:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//sendmsg
app.post("/sendmsg", async (req, res) => {
  let client;
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    const sentId = decoded.Id;
    const sentName = decoded.name;
    const sentRole = decoded.roal;

    const { ticketId, gotcontent } = req.body;

    if (!ticketId || !gotcontent) {
      return res
        .status(400)
        .json({ error: "ticketId and gotcontent required" });
    }

    client = await connect();
    const ticketCol = client.db("Rencoders").collection("Tickets");

    const existingTicket = await ticketCol.findOne({ ticketId });

    if (!existingTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const newMessage = {
      senderId: sentId,
      senderRole: sentRole,
      senderName: sentName,
      content: gotcontent,
      timestamp: new Date().toISOString(),
    };

    await ticketCol.updateOne(
      { ticketId },
      { $push: { messages: newMessage } }
    );

    return res.status(200).json({ message: "Message added to ticket" });
  } catch (error) {
    console.error("Error in /sendmsg:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//get open tickets
app.post("/getopentickets", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const client = await connect();
    const ticketCol = client.db("Rencoders").collection("Tickets");

    const tickets = await ticketCol
      .find(
        { update: "open" },
        { projection: { ticketId: 1, messages: { $slice: 1 } } }
      )
      .toArray();
    const formattedTickets = tickets.map((ticket) => ({
      ticketId: ticket.ticketId,
      firstMessage: ticket.messages?.[0] || null,
      createdBy: ticket.createdBy,
      assignedTo: ticket.assignedTo,
    }));

    console.log("ticketss", formattedTickets);

    return res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});
//get lead open tickets
app.post("/leadopenedtickets", async (req, res) => {
  let client;
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.Id;
    const userName = decoded.name;

    client = await connect();
    const ticketCol = client.db("Rencoders").collection("Tickets");

    const tickets = await ticketCol
      .find(
        {
          update: "open",
          $or: [{ createdBy: userId }, { assignedTo: userName }],
        },
        {
          projection: {
            ticketId: 1,
            messages: { $slice: 1 },
            createdBy: 1,
            assignedTo: 1,
          },
        }
      )
      .toArray();

    const formattedTickets = tickets.map((ticket) => ({
      ticketId: ticket.ticketId,
      firstMessage: ticket.messages?.[0] || null,
      createdBy: ticket.createdBy,
      assignedTo: ticket.assignedTo,
    }));

    return res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//get close tickets
app.post("/getclosedtickets", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const client = await connect();
    const ticketCol = client.db("Rencoders").collection("Tickets");

    const tickets = await ticketCol
      .find(
        { update: "close" },
        { projection: { ticketId: 1, messages: { $slice: 1 } } }
      )
      .toArray();
    const formattedTickets = tickets.map((ticket) => ({
      ticketId: ticket.ticketId,
      firstMessage: ticket.messages?.[0] || null,
    }));

    console.log("ticketss", formattedTickets);

    return res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//update ticket
app.post("/updatetickets", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
     const userRole = decoded.roal;
     if (userRole !== "admin") {
       return res.status(403).json({ error: "Only admins can close tickets" });
     }
    const { ticketId } = req.body;
    const client = await connect();
    const ticketCol = client.db("Rencoders").collection("Tickets");

    const ticket = await ticketCol.findOneAndUpdate(
      { ticketId },
      { $set: { update: "close" } },
      { returnDocument: "after" }
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    console.log("updateticket", ticket);
    return res
      .status(200)
      .json({ message: "Ticket closed successfully", ticket: ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//get message
app.post("/getmessage", async (req, res) => {
  try {
    const { error: headerError } = headerSchema.validate(req.headers);
    if (headerError) {
      return res.status(400).json({ error: headerError.details[0].message });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    const { ticketId } = req.body;

    // const pairIds = [adminId, leadId].sort();
    // const ticketId = `${pairIds.join("")}`;

    const client = await connect();
    const ticketCol = client.db("Rencoders").collection("Tickets");

    const ticket = await ticketCol.findOne(
      { ticketId },
      { projection: { _id: 0, ticketId: 1, messages: 1, assignedTo:1 } }
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

//lead-ticket
// app.post("/lead-tickets", async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     const decoded = jwt.verify(token, SECRET_KEY);
//     const leadId = decoded.Id;

//     console.log("Logged-in Lead ID:", leadId);

//     const client = await connect();
//     const ticketCol = client.db("Rencoders").collection("Tickets");

//     const tickets = await ticketCol
//       .find({
//         $or: [{ assignedTo: leadId }, { createdBy: leadId }],
//       })
//       .toArray();

//     res.status(200).json({ tickets });
//   } catch (error) {
//     console.error("Error fetching lead tickets:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.listen(PORT, "0.0.0.0", () => {
  console.log("server listen port", PORT);
});
