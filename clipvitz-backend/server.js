cat > clipvitz-backend/server.js << EOL
const express = require('express');
   const cors = require('cors');
   const ClipVitz = require('./ClipVitz');

   const app = express();
   const port = process.env.PORT || 3000;
   const clipVitz = new ClipVitz();

   app.use(cors());
   app.use(express.json());

   app.post('/generate', async (req, res) => {
     try {
       const { prompt } = req.body;
       if (!prompt) {
         return res.status(400).json({ error: 'Prompt is required' });
       }
       console.log("Generating social post for prompt:", prompt);
       const post = await clipVitz.generateSocialPost(prompt);
       res.json({ story: post });
     } catch (error) {
       console.error("Error generating social post:", error);
       res.status(500).json({ error: 'Failed to generate social post.' });
     }
   });

   module.exports = app;
   EOL