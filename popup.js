
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const statusEl = document.getElementById('status');
  const backendUrl = 'http://localhost:3000/generate';

  generateBtn.addEventListener('click', async () => {
    // --- Start loading state ---
    statusEl.textContent = 'Weaving a tale from Moscownpur’s enchanted gardens...';
    statusEl.classList.remove('success');
    statusEl.classList.add('loading');
    generateBtn.disabled = true;

    try {
      const payload = {
        prompt: 'Generate a short, imaginative story about a magical garden that tells secrets to those who listen.'
      };
      console.log('Sending payload:', payload);
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      console.log('Received response:', data);
      await navigator.clipboard.writeText(data.story);

      // --- Success state ---
      statusEl.classList.remove('loading');
      statusEl.classList.add('success');
      statusEl.textContent = `Copied to clipboard! 📋\n${data.story}`;

    } catch (error) {
      console.error('Error details:', error);
      statusEl.classList.remove('loading');
      statusEl.classList.remove('success');
      statusEl.textContent = `Oops! ${error.message}`;
    } finally {
      setTimeout(() => {
        generateBtn.disabled = false;
        statusEl.textContent = '';
        statusEl.classList.remove('success', 'loading');
      }, 10000); // Longer timeout for prose post
    }
  });
});
