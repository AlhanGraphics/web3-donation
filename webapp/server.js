const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const { ethers } = require('ethers');

app.use(bodyParser.json());

// Utility function to generate a random value
function generateRandomValue(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let randomValue = '';

  for (let i = 0; i < length; i++) {
    randomValue += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return randomValue;
}

app.get('/nonce', (req, res) => {
  const nonce = generateRandomValue(16);
  const address = req.query.address;

  const message = `Please sign this message for authentication.\n\nYour address: ${address}:\n\nNonce: ${nonce}`;

  res.json({ message, nonce });
});

app.post('/validate-signature', async (req, res) => {
  try {
    const { signature, addr, message } = req.body;
    if (!signature || !addr || !message) {
      return res.status(400).json({ success: false, message: 'Missing required parameters.' });
    }

    const signer = ethers.verifyMessage(message, signature);

    if (signer.toLowerCase() !== addr.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized signer.' });
    }

    return res.status(200).json({ success: true, message: 'Signature verified.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.use(express.static('public', {
  extensions: ['js'],
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  },
}));

app.get('/', (req, resp) => {
  resp.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});
