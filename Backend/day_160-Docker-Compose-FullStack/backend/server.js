import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(morgan('dev'));
app.use(cors());                     // useful while developing
// app.use(express.static('public'));  // Not needed - frontend runs on separate Vite server

// ---------- AniList helper ----------
async function fetchCharactersFromAniList(page = 1, perPage = 28) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        characters(sort: FAVOURITES_DESC) {
          id
          name {
            full
            userPreferred
          }
          image {
            large
            medium
          }
        }
      }
    }
  `;

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { page, perPage },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'AniList GraphQL error');
  }

  // Map to a clean shape your frontend expects
  return json.data.Page.characters.map((c) => ({
    id: c.id,
    name: c.name.full || c.name.userPreferred || 'Unknown',
    image: c.image.large || c.image.medium || null,
  }));
}

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello, World!' });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await fetchCharactersFromAniList(1, 24); // first page, 12 items
    res.status(200).json(users);
  } catch (err) {
    console.error('Failed to fetch from AniList:', err.message);
    res.status(502).json({ error: 'Failed to fetch characters from AniList' });
  }
});

// Catch-all (fix the path)
app.use((req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});