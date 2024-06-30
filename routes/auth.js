require('dotenv').config();
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// User Registration
router.post('/register',  
  [
     body("username", "Enter a valid name").isLength({ min: 3 }),
     body("email", "Enter a valid email").isEmail(),
     body("password", "Password must be atleast 5 characters").isLength({
       min: 5,
     }),
     body("dob", "Enter a valid date of birth").isDate(),
   ],
   async (req, res) => {
     let success = false;
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({success, errors: errors.array() });
     }
     try {
       let user = await User.findOne({ email: req.body.email});
       if (user) {
         return res
           .status(400)
           .json({success, error: "Sorry a user with this email already exists" });
       }
 
       let commonuser = await User.findOne({ username: req.body.username});
       if (commonuser) {
         return res
           .status(400)
           .json({success, error: "Sorry a user with this username already exists" });
       }
 
       const salt = await bcrypt.genSalt(10);
       const secPass = await bcrypt.hash(req.body.password, salt);
       // Create a new user
       user = await User.create({
         username: req.body.username,
         password: secPass,
         email: req.body.email,
         dob: req.body.dob,
       });
 
       const data = {
         user: {
           id: user.id,
         },
       };
       const authToken = jwt.sign(data, JWT_SECRET);
       console.log(authToken);
 
       success = true;
       res.json({
        success,
        authToken,
        user: {
          username: req.body.username,
          email: req.body.email,
          DOB:req.body.dob
        },
      });
     } catch (error) {
       console.error(error.message);
       res.status(500).send("Some Error Occurred");
     }
   });

// User Login
router.post(
  "/login",
  [
    body("username", "Enter a valid username").exists(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      let user = await User.findOne({ username });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            errors: "Please try to login with correct credentials",
          });
      }
      const passComparer = await bcrypt.compare(password, user.password);
      if (!passComparer) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            errors: "Please try to login with correct credentials",
          });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;

      res.json({
        success,
        authToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          DOB:user.dob
        },
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error Occurred");
    }
  }
);

module.exports = router;
