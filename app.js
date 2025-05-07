//jshint esversion:6
//jshint esversion:6
require('dotenv').config(); 
const express = require("express"); 
const bodyParser = require("body-parser"); 
const ejs = require("ejs"); 
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);   

app.use(express.static("public")); 
app.set('view engine', 'ejs'); 
app.use(bodyParser.urlencoded({ 
    extended: true 
}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema ({ 
    email : String, 
    password: String 
});


userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("Users", userSchema); 
app.get("/", function(req, res){ 
    res.render("home"); 
});
app.get("/login", function(req, res){ 
    res.render("login"); 
});
app.get("/register", function(req, res){ 
    res.render("register"); 
});

app.post("/register", async function(req, res) {
    try {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
        
        await newUser.save(); // ✅ No callback
        res.render("secrets");
    } catch (err) {
        console.log(err);
        res.send("Error registering user.");
    }
});

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });

        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            } else {
                res.send("Incorrect password.");
            }
        } else {
            res.send("User not found.");
        }
    } catch (err) {
        console.log(err);
        res.send("Error during login.");
    }
});


app.listen(3000, function() { 
    console.log("server started on port 3000.") 
});