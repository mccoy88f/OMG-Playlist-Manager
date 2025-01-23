# OMG Playlist Manager

A modern web application for managing M3U playlists with features for synchronization, customization, and sharing.

## Features

- Import and sync M3U playlists from URLs
- Create custom playlists
- Edit channel details including EPG mapping
- Drag-and-drop channel reordering
- Share playlists via public URLs
- Support for custom tags and EPG
- Modern responsive interface

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/omg-playlist-manager.git
cd omg-playlist-manager
```

2. Copy and configure environment files:
```bash
cp frontend/.env.example frontend/.env
```

3. Build and start the containers:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Run the backend:
```bash
uvicorn main:app --reload
```

#### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Project Structure

```
omg-playlist-manager/
├── backend/             # FastAPI backend
│   ├── main.py         # Main application file
│   ├── models.py       # Pydantic models
│   └── m3u_utils.py    # M3U parsing utilities
│
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── lib/        # Utilities and API
│   └── public/         # Static assets
│
└── data/              # Database and storage
```

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
