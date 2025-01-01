const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Initialize dotenv to use environment variables
dotenv.config();

// Set up the Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

const port = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB using the URI from .env
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Simple route to check server status
app.get('/', (req, res) => {
  res.send('Budget Planning API is running!');
});

// Example route for adding an expense
const Expense = require('./models/Expense');

app.post('/add-expense', async (req, res) => {
  const { date, amount, category, description } = req.body;

  try {
    const newExpense = new Expense({ date, amount, category, description });
    await newExpense.save();
    res.status(201).send('Expense added successfully!');
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense', error });
  }
});

// Get all expenses

app.get('/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find()
        res.status(200).send(expenses)
    } catch (error) {
        // Handle any errors
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
})


// Edit Expenses

app.put('/edit-expense', async (req, res) => {
    try {
        const { id, date, amount, category, description } = req.body;
        if (!id || !date || !amount || !category || !description) {
            return res.status(400).json({ error: "All fields are required!" });
        }
        const updatedExpense = await Expense.findByIdAndUpdate(id, { date, amount, category, description }, { new: true })
        if (!updatedExpense) {
            return res.status(400).json({ error: "Expense not found!" });

        }
        res.status(200).send('Expense edited successfully!');

    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: "Failed to fetch expenses" })
    }
})

// Delete expense

app.delete('/delete-expense',async (req, res)=>{

    try{
        const {id} = req.body
        // Validate input
        if (!id) {
            return res.status(400).json({ error: "Expense ID is required!" });
        }

        const deletedExpense = await Expense.deleteOne({_id: id})
        // Check if an expense was deleted
        if (deletedExpense.deletedCount === 0) {
            return res.status(404).json({ error: "Expense not found!" });
        }
    
        res.status(200).send("Expense deleted successfully!")
    }catch(error){
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: "Failed to delete expense" })
    }

})

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


module.exports = app;