const express = require('express');
const path = require('path');
const { config } = require('dotenv');
const cors = require('cors');
const OpenAI = require('openai');

// Load environment variables from a .env file
config();

// Create an instance of Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Initialize OpenAI with API key
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // Fetch the OpenAI API key from the environment variables
// });

const openai = new OpenAI({
  apiKey: 'sk-5hdK7Axqynl6efelr0cGnsgTj3pBjRHT2dAYv4kIEET3BlbkFJWTtCuhLOjVJsSJ4gPXw6NAP1bjdoQsqlezIr20TfsA', // Replace with your actual API key
});

console.log('Loaded API Key:', process.env.OPENAI_API_KEY);
// Serve the frontend (HTML, CSS, JS)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html file
});

// Endpoint to handle ChatGPT requests
app.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body; // Get the prompt from the request body
        const response = await generateResponse(prompt); // Call OpenAI API
        res.json({ reply: response }); // Send back the response to the frontend
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to generate response from ChatGPT
async function generateResponse(prompt) {
    try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": prompt },
          ],
        });
        const reply = completion.choices[0].message.content.trim();
        return reply;
    } catch (error) {
        console.error('OpenAI Request Error:', error);
        throw error;
    }
}

// Serve static files (like HTML, CSS, and JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
