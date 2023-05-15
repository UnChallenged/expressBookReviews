const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username: user.username }, 'fingerprint_customer');
    return res.status(200).json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { review } = req.body;
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  let decodedToken;
  try {
    const token = req.headers.authorization?.split(' ')[1];  
    decodedToken = jwt.verify(token, 'fingerprint_customer');
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
  const { username } = decodedToken;
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  const userReviewIndex = Object.values(books[isbn].reviews).findIndex(r => r.username === username);
  if (userReviewIndex >= 0) {
    const reviewKey = `review ${userReviewIndex + 1}`;
    books[isbn].reviews[reviewKey].review = review;
  } else {
    const newReviewKey = `review ${Object.keys(books[isbn].reviews).length + 1}`;
    books[isbn].reviews[newReviewKey] = { username, review };
  }
  return res.status(200).json({ message: "Review saved successfully" });

});

// delete a book review

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let decodedToken;
    try {
      const token = req.headers.authorization?.split(' ')[1];  
      decodedToken = jwt.verify(token, 'fingerprint_customer');
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const { username } = decodedToken;
    
    if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    
    if (!books[isbn].reviews) {
      return res.status(404).json({ message: `No reviews found for book with ISBN ${isbn}` });
    }
    
    // delete all reviews from the specified user
    let reviews = books[isbn].reviews;
    Object.keys(reviews).forEach((key) => {
        if (reviews[key].username === username) {
          delete reviews[key];
          isDeleted = true;
        }
      });
    
    return res.json({ message: "Reviews deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
