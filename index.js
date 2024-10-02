const express = require('express');
const path = require('path');
const { config } = require('dotenv');
const cors = require('cors');
const OpenAI = require('openai');
const axios = require('axios');

// Load environment variables from a .env file
config();

// Create an instance of Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(cors());

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Fetch the OpenAI API key from the environment variables
});

// Define routes or API endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/chat', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const response = await generateResponse(prompt); // Call OpenAI API and get the response
        res.json({ reply: response }); // Send back the response to the frontend
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function generateResponse(prompt) {
    try {
        const completion = await openai.chat.completions.create({
          messages: [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}, // Use the user's input as a message
          ],
          model: "gpt-3.5-turbo",
        });

        const reply = completion.choices[0].message.content.trim();

        // Call Mirai bot API with the generated response
        await sendToMiraiBot(reply);

        return reply;
    } catch (error) {
        console.error('OpenAI Request Error:', error);
        throw error;
    }
}

async function sendToMiraiBot(message) {
    const miraiBotUrl = 'https://2b268584-45ae-4575-8955-96cdab6b7fba-00-14w729bzw8c0g.sisko.replit.dev/'; // Replace with your Mirai bot API endpoint
    const miraiBotData = {
        message,
    };

    try {
        // Make a POST request to Mirai bot API
        await axios.post(miraiBotUrl, miraiBotData);
        console.log('Message sent to Mirai bot:', message);
    } catch (error) {
        console.error('Error sending message to Mirai bot:', error);
    }
}

// Serve static files (e.g., HTML, CSS, client-side JS)
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
