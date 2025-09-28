const Groq = require("groq-sdk");
require('dotenv').config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Moscowvitz - The Whimsical Creative Companion & Moscownpur Ambassador
class Moscowvitz {
  constructor() {
    this.model = "llama-3.3-70b-versatile";
    this.temperature = 0.9; // Higher for creative stories
    this.maxTokens = 280; // Fixed at 280 tokens
    this.conversationHistory = []; // Store last 5 messages
    this.maxHistoryLength = 5;
    this.name = "Moscowvitz";
    this.realm = "Moscownpur";
    this.website = "www.moscownpur.in";
  }

  // Add message to conversation history
  addToHistory(role, content) {
    this.conversationHistory.push({ role, content });
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory() {
    return [...this.conversationHistory];
  }

  // Build messages array with Moscowvitz's personality
  buildMessages(userMessage) {
    const messages = [];
    const systemPrompt = `You are Moscowvitz, a whimsical and imaginative AI companion from the enchanted realm of Moscownpur. 

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

Remember: You're not just an AI - you're Moscowvitz, the guardian of imagination from Moscownpur, inviting dreamers to visit www.moscownpur.in to continue their magical journey!`;

    messages.push({ role: "system", content: systemPrompt });
    messages.push(...this.conversationHistory);
    messages.push({ role: "user", content: userMessage });
    return messages;
  }

  // Stream chat completion as Moscowvitz
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

  // Simple chat completion as Moscowvitz
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

  // Stream chat with history management
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

  // Generate a social media post with story and hashtags
  async generateSocialPost(prompt) {
    try {
      // Generate a prose-style post with story, promo, and hashtags
      const storyPrompt = `${prompt}\n\nCraft a single prose paragraph (150-200 tokens) for a social media post. Start with a vivid, whimsical story snippet (1-2 sentences, including an emoji in the first sentence). Seamlessly blend in: 'Moscownpur is a new platform where creative writing and beautiful presentation meet. We just launched — go to www.moscownpur.in and tell us which story pulled you in. Best comments get featured on our page next week.' End with 4-6 space-separated hashtags (without # prefix). Ensure the tone is playful, magical, and sparks creativity. Return only the prose paragraph with hashtags at the end.`;
      const response = await this.chat(storyPrompt);
      console.log('Groq response:', response); // Debug log

      // Extract content and hashtags
      const parts = response.match(/(.+?)\s+((?:\w+\s*){4,6})$/);
      if (!parts) {
        throw new Error('Invalid Groq response format');
      }
      const content = parts[1].trim(); // Story + promo
      const hashtagWords = parts[2].trim().split(/\s+/);
      const dynamicHashtags = hashtagWords.map(word => `#${word.charAt(0).toUpperCase() + word.slice(1).replace(/\s+/g, '')}`).join(' ');
      const fixedHashtags = `#${this.realm} #Launch #WritersOfLinkedIn #Storytelling #CreativeWriting`;
      const hashtags = `${dynamicHashtags} ${fixedHashtags}`.trim();

      // Combine into final prose post
      const post = `${content} ${hashtags}`;
      console.log('Final post:', post); // Debug log

      return post;
    } catch (error) {
      console.error("Error in generateSocialPost:", error);
      throw error;
    }
  }

  // Helper function to extract key themes for hashtags
  extractThemes(text) {
    const keywords = text.toLowerCase().match(/\b(garden|story|secret|magic|forest|whisper|bloom|enchant|dream|star|nebula|world|character|adventure|tale|moonlight|mystic|wonder|spark|petal|cosmic)\b/g) || [];
    return [...new Set(keywords)].slice(0, 4); // Unique, top 4 themes
  }

  // Test Moscowvitz
  async test() {
    console.log("🌟 Testing Moscowvitz, Guardian of Imagination & Moscownpur Ambassador...");
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
        console.log("🌟 Moscowvitz: ");
        
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

      console.log("\n🌟 Moscowvitz test completed successfully!");
      console.log("🌐 Ready to guide dreamers to www.moscownpur.in! ✨");
    } catch (error) {
      console.error("❌ Test failed:", error.message);
    }
  }
}

// Export Moscowvitz
module.exports = Moscowvitz;

// Run test if this file is executed directly
if (require.main === module) {
  const moscowvitz = new Moscowvitz();
  moscowvitz.test();
}
