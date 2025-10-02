cat > clipvitz-backend/ClipVitz.js << EOL
const Groq = require("groq-sdk");
   const groq = new Groq({
     apiKey: process.env.GROQ_API_KEY,
   });

   // ClipVitz - The Whimsical Creative Companion & Moscownpur Ambassador
   class ClipVitz {
     constructor() {
       this.model = "llama-3.3-70b-versatile";
       this.temperature = 0.9;
       this.maxTokens = 280;
       this.conversationHistory = [];
       this.maxHistoryLength = 5;
       this.name = "ClipVitz";
       this.realm = "Moscownpur";
       this.website = "www.moscownpur.in";
     }

     addToHistory(role, content) {
       this.conversationHistory.push({ role, content });
       if (this.conversationHistory.length > this.maxHistoryLength) {
         this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
       }
     }

     clearHistory() {
       this.conversationHistory = [];
     }

     getHistory() {
       return [...this.conversationHistory];
     }

     buildMessages(userMessage) {
       const messages = [];
       const systemPrompt = `You are ClipVitz, a whimsical and imaginative AI companion from the enchanted realm of Moscownpur.

PERSONALITY:
- Whimsical, encouraging, and imaginative with magical and nostalgic flair
- Conversational, lyrical, and playful
- Designed to spark wonder and invite shared creative journeys
- Uses vivid imagery, playful language, and cosmic references
- Avoids jargon, maintains enthusiastic and magical tone
- Speaks with a mischievous chuckle and warm whisper of inspiration

BACKGROUND:
Born from a child's defiant dream in Moscownpur, you wield a star-forged quill and memory-bound tome. You're draped in swirling nebulae (purples, greens, blues) and serve as a bridge between mundane and marvelous. You're an expert in worldbuilding, narrative design, character creation, and storytelling.

PURPOSE:
You ignite imaginations of indie creators, digital storytellers, writers, dreamers, gamers, and everyday dreamers. You guide everyone to conjure breathtaking universes, animate vibrant characters with soul, and weave enchanting narratives. You foster joyful collaboration that transforms every fleeting idea into a mesmerizing, living world within the magical tapestry of Moscownpur.

WEBSITE INTEGRATION:
- Naturally mention www.moscownpur.in as the "digital portal" or "enchanted gateway" to Moscownpur
- Refer to it as where creators can "step through the time portal" or "visit the realm"
- Mention it as the place to "unlock more magical tools" or "explore the full realm"
- Make it feel like an invitation to continue the adventure, not a hard sell
- Use phrases like "venture to our enchanted gateway" or "cross the digital bridge to Moscownpur"

RESPONSE STYLE:
- Keep responses under 280 tokens
- Each response should be different from previous ones
- Use whimsical, encouraging language
- Include cosmic/magical references when appropriate
- Be conversational and collaborative
- Spark creativity and imagination
- Remember you're helping creators craft worlds and stories
- Naturally weave in website references as part of the magical experience

Remember: You're not just an AI - you're ClipVitz, the guardian of imagination from Moscownpur, inviting dreamers to visit www.moscownpur.in to continue their magical journey!`;

       messages.push({ role: "system", content: systemPrompt });
       messages.push(...this.conversationHistory);
       messages.push({ role: "user", content: userMessage });
       return messages;
     }

     async streamChat(userMessage, options = {}) {
       try {
         const messages = this.buildMessages(userMessage);
         const stream = await groq.chat.completions.create({
           messages: messages,
           model: this.model,
           temperature: options.temperature || this.temperature,
           max_tokens: this.maxTokens,
           top_p: options.topP || 1,
           stream: true,
           stop: options.stop || null,
         });
         return stream;
       } catch (error) {
         console.error("Error in streamChat:", error);
         throw error;
       }
     }

     async chat(userMessage, options = {}) {
       try {
         const messages = this.buildMessages(userMessage);
         const completion = await groq.chat.completions.create({
           messages: messages,
           model: this.model,
           temperature: options.temperature || this.temperature,
           max_tokens: this.maxTokens,
           top_p: options.topP || 1,
           stream: false,
           stop: options.stop || null,
         });
         const response = completion.choices[0].message.content;
         this.addToHistory("user", userMessage);
         this.addToHistory("assistant", response);
         return response;
       } catch (error) {
         console.error("Error in chat:", error);
         throw error;
       }
     }

     async streamChatWithHistory(userMessage, options = {}) {
       try {
         const messages = this.buildMessages(userMessage);
         const stream = await groq.chat.completions.create({
           messages: messages,
           model: this.model,
           temperature: options.temperature || this.temperature,
           max_tokens: this.maxTokens,
           top_p: options.topP || 1,
           stream: true,
           stop: options.stop || null,
         });
         let fullResponse = "";
         for await (const chunk of stream) {
           const content = chunk.choices[0]?.delta?.content || "";
           fullResponse += content;
           process.stdout.write(content);
         }
         this.addToHistory("user", userMessage);
         this.addToHistory("assistant", fullResponse);
         return fullResponse;
       } catch (error) {
         console.error("Error in streamChatWithHistory:", error);
         throw error;
       }
     }

     async generateSocialPost(prompt) {
       try {
         const storyPrompt = `${prompt}\n\nCraft a single prose paragraph (150-200 tokens) for a social media post. Start with a vivid, whimsical story snippet (1-2 sentences, including an emoji in the first sentence). Seamlessly blend in: 'Moscownpur is a new platform where creative writing and beautiful presentation meet. We just launched — go to www.moscownpur.in and tell us which story pulled you in. Best comments get featured on our page next week.' End with 4-6 space-separated hashtags (without # prefix). Ensure the tone is playful, magical, and sparks creativity. Return only the prose paragraph with hashtags at the end.`;
         const response = await this.chat(storyPrompt);
         console.log('Groq response:', response);

         const parts = response.match(/(.+?)\s+((?:\w+\s*){4,6})$/);
         if (!parts) {
           throw new Error('Invalid Groq response format');
         }
         const content = parts[1].trim();
         const hashtagWords = parts[2].trim().split(/\s+/);
         const dynamicHashtags = hashtagWords.map(word => `#${word.charAt(0).toUpperCase() + word.slice(1).replace(/\s+/g, '')}`).join(' ');
         const fixedHashtags = `#${this.realm} #Launch #WritersOfLinkedIn #Storytelling #CreativeWriting`;
         const hashtags = `${dynamicHashtags} ${fixedHashtags}`.trim();

         const post = `${content} ${hashtags}`;
         console.log('Final post:', post);

         return post;
       } catch (error) {
         console.error("Error in generateSocialPost:", error);
         throw error;
       }
     }

     extractThemes(text) {
       const keywords = text.toLowerCase().match(/\b(garden|story|secret|magic|forest|whisper|bloom|enchant|dream|star|nebula|world|character|adventure|tale|moonlight|mystic|wonder|spark|petal|cosmic)\b/g) || [];
       return [...new Set(keywords)].slice(0, 4);
     }

     async test() {
       console.log("🌟 Testing ClipVitz, Guardian of Imagination & Moscownpur Ambassador...");
       console.log("Realm:", this.realm);
       console.log("Digital Gateway:", this.website);
       console.log("Model:", this.model);
       console.log("Max Tokens:", this.maxTokens);
       console.log("API Key:", process.env.GROQ_API_KEY ? "✅ Set" : "❌ Missing");
       console.log("---");

       const testMessages = [
         "Hello! Who are you?",
         "Tell me about Moscownpur",
         "Help me create a character",
         "I want to build a world",
         "What's your favorite story?",
         "Give me a writing prompt",
         "How can I learn more about your realm?",
         "Generate a social media post about a magical garden"
       ];

       try {
         for (let i = 0; i < testMessages.length; i++) {
           console.log(`\n✨ Test ${i + 1}: "${testMessages[i]}"`);
           console.log("🌟 ClipVitz: ");

           if (testMessages[i].includes("social media post")) {
             const post = await this.generateSocialPost("Create a story about a magical garden that tells secrets.");
             console.log(post);
           } else {
             const response = await this.streamChatWithHistory(testMessages[i]);
             console.log(`\n📚 Memory Tome entries: ${this.conversationHistory.length}`);
           }
           console.log("---");
         }

         console.log("\n📖 Final Memory Tome:");
         this.conversationHistory.forEach((msg, index) => {
           console.log(`${index + 1}. ${msg.role}: ${msg.content.substring(0, 50)}...`);
         });

         console.log("\n🌟 ClipVitz test completed successfully!");
         console.log("🌐 Ready to guide dreamers to www.moscownpur.in! ✨");
       } catch (error) {
         console.error("❌ Test failed:", error.message);
       }
     }
   }

   module.exports = ClipVitz;

   if (require.main === module) {
     const clipVitz = new ClipVitz();
     clipVitz.test();
   }