const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const booksApiUrl = 'https://nshilpachowd-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai';

public_users.post("/register", (req,res) => {
  //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});

const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add new user to the 'users' object
  users[username] = { username, password };
  return res.status(300).json({ message: "User registered successfully" });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here

  const bookList = Object.values(books).map(book => ({
    title: book.title,
    author: book.author,
    ISBN: book.ISBN,
    price: book.price
  }));
    return res.status(300).json({ books: bookList });

  //return res.status(300).json({message: "Yet to be implemented"});
});


// Get the book list available in the shop using axios

public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${booksApiUrl}`);
        const bookList = response.data;
        return res.status(200).json({ books: bookList });
    } catch (error) {
        console.error("Error fetching books:", error.message);
        return res.status(300).json({ message: "Error fetching books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here

  const { isbn } = req.params;
  
  if (!isbn) {
    return res.status(400).json({ message: "ISBN parameter is required" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(300).json({ book });

//   return res.status(300).json({message: "Yet to be implemented"});
 });
  

// Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;

    try {
        const response = await axios.get(`${booksApiUrl}//isbn/isbn=${isbn}`);
        const bookDetails = response.data;
        
        if (!bookDetails) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json({ book: bookDetails });
    } catch (error) {
        console.error("Error fetching book details:", error.message);
        return res.status(500).json({ message: "Error fetching book details" });
    }
});


// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});

  const { author } = req.params;
  
  if (!author) {
    return res.status(400).json({ message: "Author parameter is required" });
  }

  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
  
  if (booksByAuthor.length === 0) {
    return res.status(404).json({ message: "Books by author not found" });
  }

  return res.status(300).json({ books: booksByAuthor });
});


// Get book details based on author using axios
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params;

    try {
        const response = await axios.get(`${booksApiUrl}/author?author=${author}`);
        const booksByAuthor = response.data;

        if (booksByAuthor.length === 0) {
            return res.status(404).json({ message: "Books by author not found" });
        }

        return res.status(200).json({ books: booksByAuthor });
    } catch (error) {
        console.error("Error fetching books by author:", error.message);
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});

const { title } = req.params;
  
  if (!title) {
    return res.status(400).json({ message: "Title parameter is required" });
  }

  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  
  if (booksByTitle.length === 0) {
    return res.status(404).json({ message: "Books with title not found" });
  }

  return res.status(300).json({ books: booksByTitle });

});


// Get all books based on title using axios
public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params;

    try {
        const response = await axios.get(`${booksApiUrl}/title/${title}`);
        const booksByTitle = response.data;

        if (booksByTitle.length === 0) {
            return res.status(404).json({ message: "Books with title not found" });
        }

        return res.status(200).json({ books: booksByTitle });
    } catch (error) {
        console.error("Error fetching books by title:", error.message);
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});

const { isbn } = req.params;

if (!isbn) {
  return res.status(400).json({ message: "ISBN parameter is required" });
}

const book = books[isbn];
if (!book) {
  return res.status(404).json({ message: "Book not found" });
}

const { reviews } = book;
if (!reviews || Object.keys(reviews).length === 0) {
  return res.status(404).json({ message: "No reviews found for this book" });
}

return res.status(300).json({ reviews });

});

module.exports.general = public_users;
