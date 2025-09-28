
   const express = require('express');
   const cors = require('cors');
   const Moscowvitz = require('./Moscowvitz');

   const app = express();
   const port = process.env.PORT || 3000;
   const moscowvitz = new Moscowvitz();

   app.use(cors());
   app.use(express.json());

   app.post('/generate', async (req, res) => {
     try {
       const { prompt } = req.body;
       if (!prompt) {
         return res.status(400).json({ error: 'Prompt is required' });
       }
       console.log("Generating social post for prompt:", prompt);
       const post = await moscowvitz.generateSocialPost(prompt);
       res.json({ story: post });
     } catch (error) {
       console.error("Error generating social post:", error);
       res.status(500).json({ error: 'Failed to generate social post.' });
     }
   });

   module.exports = app;
