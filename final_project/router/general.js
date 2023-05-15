const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const userExists = users.find(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const user = { username, password };
    users.push(user);
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      const result = await new Promise((resolve, reject) => {
        resolve(books);
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const book = await new Promise((resolve, reject) => {
        if (books[req.params['isbn']]) {
          resolve(books[req.params['isbn']]);
        } else {
          reject("Book not found");
        }
      });
      return res.status(200).json(book);
    } catch (error) {
      return res.status(404).json({ message: error });
    }
  });
// Get book details based on author
public_users.get('/author/:author', function(req, res) {
    new Promise(function(resolve, reject) {
      const filteredBooks = Object.values(books).filter(f => f.author === req.params['author']);
      resolve(filteredBooks);
    })
    .then(function(filteredBooks) {
      res.status(200).json(filteredBooks);
    })
    .catch(function(error) {
      res.status(500).json({ error: error.message });
    });
  })

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const searchTitle = req.params['title'];
    const results = Object.values(books).filter(book => book.title === searchTitle);
  
    try {
      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        throw { message: `No books found with title ${searchTitle}` };
      }
    } catch (err) {
      res.status(404).json(err);
    }
  });
  

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(200).json(books[req.params['isbn']]["reviews"]);
});

module.exports.general = public_users;
