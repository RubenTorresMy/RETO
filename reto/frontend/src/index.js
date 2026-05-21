const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.FRONTEND_PORT || 3001);
const staticRoot = __dirname;

app.use(express.static(staticRoot));

app.get('/', (req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

app.listen(port, () => {
  console.log(`VEXILO frontend running at http://localhost:${port}`);
});
