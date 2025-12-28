
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'active', 
    architecture: 'Supabase-Client-Side',
    message: 'GenSpark backend is operating in stateless mode. All data is handled by Supabase.' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GenSpark Stateless Server running on port ${PORT}`);
});
