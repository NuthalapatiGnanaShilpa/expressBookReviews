const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"Shilpa","password":"1234"},{"username":"vamsi", "password":"5678"}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
// return users.includes(username);
return users.some(user => user.username === username);

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(401).json({ message: "Invalid username" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid password" });
    }

    // If username and password are valid, create a JWT token
    const token = jwt.sign({ username }, "secret_key");
    req.session.authorization = { accessToken: token };

    return res.status(300).json({ token });

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});

const { isbn } = req.params;
const { review } = req.query;
const { authorization } = req.headers;

if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
}

if (!authorization) {
    return res.status(401).json({ message: "Unauthorized" });
}

try {
    const token = authorization;//.split(" ")[1];
    const decoded = jwt.verify(token, "secret_key");
    const { username } = decoded;

    // Check if the book with given ISBN exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user already has a review for this ISBN
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    if (books[isbn].reviews[username]) {
        // Modify existing review
        books[isbn].reviews[username] = review;
        return res.status(300).json({ message: "Review modified successfully" });
    } else {
        // Add new review
        books[isbn].reviews[username] = review;
        return res.status(300).json({ message: "Review added successfully" });
    }
} catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
}
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { authorization } = req.headers;

    if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
    }

    if (!authorization) {
        return res.status(401).json({ message: "Unauthorized: Missing Authorization header" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const username = authenticatedUser(token);

    if (!username) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Check if the book with given ISBN exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for this ISBN
    const reviews = books[isbn].reviews;
    if (!reviews || !reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
