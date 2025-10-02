
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const statusEl = document.getElementById('status');
  
  // Groq API configuration
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const GROQ_API_KEY = 'gsk_your_groq_key'; // Replace with your actual Groq API key

  generateBtn.addEventListener('click', async () => {
    // --- Start loading state ---
    statusEl.textContent = 'Weaving a tale from Moscownpur enchanted gardens...';
    statusEl.classList.remove('success');
    statusEl.classList.add('loading');
    generateBtn.disabled = true;

    try {
      // Check if API key is configured
      if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
        throw new Error('Groq API key not configured. Please add your API key to popup.js');
      }

      statusEl.textContent = 'Connecting to Groq AI...';
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are Moscownpur AI, writing as the CEO of Moscownpur Studios. Your posts should feel like a personal call-to-action: bold, visionary, and inviting. In 1–2 sentences, encourage creators to build their own characters, craft cinematic universes, and share them with the world under the Moscownpur banner.'
            },
            {
              role: 'user',
              content: 'Write a post inviting everyone to create their first character in Moscownpur and begin shaping their universe.'
            }
          ],
          max_tokens: 200,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        let errorMessage = `Groq API Error (${response.status}): ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (parseError) {
          errorMessage += '\n\nCould not parse error response from Groq API.';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from Groq API. Please try again.');
      }
      
      const story = data.choices[0].message.content.trim();
      
      if (!story) {
        throw new Error('Empty response from Groq API. Please try again.');
      }
      
      // Add hashtags to the story
      const hashtags = `\n\n#Moscownpur\n#Storytelling\n#Worldbuilding\n#GamifiedCreation\n#CreativeUniverse\n#AIForCreators\n#ComicMaking\n#IndieCreators\n#CollaborativeWriting\n#DigitalStorytelling\n#CharacterDesign\n#LoreBuilders\n#FantasyWorlds\n#CreatorCommunity\n#ImmersiveStories`;
      
      const finalContent = story + hashtags;
      await navigator.clipboard.writeText(finalContent);

      // --- Success state ---
      statusEl.classList.remove('loading');
      statusEl.classList.add('success');
      statusEl.textContent = `Copied to clipboard! 📋\n\n${story}`;

    } catch (error) {
      statusEl.classList.remove('loading');
      statusEl.classList.remove('success');
      
      // Show detailed error information
      let errorMessage = `❌ Error: ${error.message}`;
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = `❌ Connection Error:\n\nCannot connect to Groq API.\n\nPlease check:\n• Your internet connection\n• Groq API key is correct\n• Groq service is available`;
      } else if (error.name === 'NotAllowedError') {
        errorMessage = `❌ Permission Error:\n\nClipboard access denied.\n\nPlease allow clipboard permissions for this extension.`;
      } else if (error.message.includes('API key')) {
        errorMessage = `❌ Configuration Error:\n\n${error.message}\n\nTo get your Groq API key:\n1. Visit https://console.groq.com/\n2. Sign up/Login\n3. Go to API Keys section\n4. Create a new API key\n5. Replace 'YOUR_GROQ_API_KEY_HERE' in popup.js`;
      }
      
      statusEl.textContent = errorMessage;
    } finally {
      setTimeout(() => {
        generateBtn.disabled = false;
        statusEl.textContent = '';
        statusEl.classList.remove('success', 'loading');
      }, 10000);
    }
  });
});
