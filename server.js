const express = require('express');
const path = require('path');

const app = express();
const port = 9999;

// Serve static files (e.g., HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

