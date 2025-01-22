from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from typing import List, Dict
import aiohttp
import asyncio
from datetime import datetime
import uuid
import sqlite3

from database import get_db, init_db
from models import (
    PlaylistCreate, PlaylistUpdate, Playlist,
    ChannelCreate, ChannelUpdate, Channel
)
from m3u_utils import parse_m3u, generate_m3u, M3UChannel

app = FastAPI(title="OMG Playlist Manager")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"status": "healthy"}

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Playlist routes
@app.get("/playlists", response_model=List[Playlist])
async def get_playlists():
    with get_db() as db:
        cursor = db.cursor()
        playlists = []
        for playlist in cursor.execute("SELECT * FROM playlists ORDER BY created_at").fetchall():
            channels = cursor.execute("""
                SELECT * FROM channels 
                WHERE playlist_id = ? 
                ORDER BY position, created_at
            """, (playlist['id'],)).fetchall()
            
            playlist_dict = dict(playlist)
            playlist_dict['channels'] = [dict(ch) for ch in channels]
            playlists.append(playlist_dict)
        
        return playlists

@app.post("/playlists", response_model=Playlist)
async def create_playlist(playlist: PlaylistCreate):
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(
            """
            INSERT INTO playlists (name, url, is_custom, public_token)
            VALUES (?, ?, ?, ?)
            """,
            (playlist.name, playlist.url, playlist.is_custom, 
             str(uuid.uuid4()) if playlist.is_custom else None)
        )
        
        new_playlist = cursor.execute(
            "SELECT * FROM playlists WHERE id = ?",
            (cursor.lastrowid,)
        ).fetchone()
        
        return dict(new_playlist)

@app.get("/playlists/{playlist_id}", response_model=Playlist)
async def get_playlist(playlist_id: int):
    with get_db() as db:
        playlist = db.execute(
            "SELECT * FROM playlists WHERE id = ?",
            (playlist_id,)
        ).fetchone()
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        channels = db.execute("""
            SELECT * FROM channels 
            WHERE playlist_id = ?
            ORDER BY position, created_at
        """, (playlist_id,)).fetchall()
        
        playlist_dict = dict(playlist)
        playlist_dict['channels'] = [dict(ch) for ch in channels]
        return playlist_dict

@app.put("/playlists/{playlist_id}", response_model=Playlist)
async def update_playlist(playlist_id: int, playlist: PlaylistUpdate):
    with get_db() as db:
        cursor = db.cursor()
        
        existing = cursor.execute(
            "SELECT * FROM playlists WHERE id = ?",
            (playlist_id,)
        ).fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        # Update only provided fields
        update_fields = []
        values = []
        if playlist.name is not None:
            update_fields.append("name = ?")
            values.append(playlist.name)
        if playlist.url is not None:
            update_fields.append("url = ?")
            values.append(playlist.url)
        
        if update_fields:
            values.append(playlist_id)
            cursor.execute(
                f"""
                UPDATE playlists 
                SET {', '.join(update_fields)}
                WHERE id = ?
                """,
                tuple(values)
            )
        
        return await get_playlist(playlist_id)

@app.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: int):
    with get_db() as db:
        cursor = db.cursor()
        
        playlist = cursor.execute(
            "SELECT * FROM playlists WHERE id = ?",
            (playlist_id,)
        ).fetchone()
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        cursor.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
        return {"message": "Playlist deleted"}

@app.post("/playlists/{playlist_id}/sync")
async def sync_playlist(playlist_id: int):
    print(f"Starting sync for playlist {playlist_id}")  # Debug log
    
    with get_db() as db:
        cursor = db.cursor()
        
        playlist = cursor.execute(
            "SELECT * FROM playlists WHERE id = ?",
            (playlist_id,)
        ).fetchone()
        
        print(f"Found playlist: {playlist}")  # Debug log
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        if not playlist['url']:
            raise HTTPException(status_code=400, detail="Playlist has no URL")
        
        try:
            print(f"Fetching URL: {playlist['url']}")  # Debug log
            async with aiohttp.ClientSession() as session:
                async with session.get(playlist['url']) as response:
                    if response.status != 200:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Failed to fetch playlist: HTTP {response.status}"
                        )
                        
                    content = await response.text()
                    print(f"Received content length: {len(content)}")  # Debug log
                    print(f"First 200 chars: {content[:200]}")  # Debug log
                    
                    try:
                        channels = parse_m3u(content)
                        print(f"Parsed {len(channels)} channels")  # Debug log
                    except Exception as e:
                        print(f"Error parsing M3U: {str(e)}")  # Debug log
                        raise HTTPException(
                            status_code=400,
                            detail=f"Failed to parse M3U content: {str(e)}"
                        )
                    
                    # Mantieni i tvg_id esistenti
                    existing_channels = {
                        ch['url']: ch['tvg_id'] 
                        for ch in cursor.execute(
                            "SELECT url, tvg_id FROM channels WHERE playlist_id = ?",
                            (playlist_id,)
                        ).fetchall()
                        if ch['tvg_id']  # Solo se tvg_id non è None
                    }
                    
                    try:
                        print("Starting database transaction")  # Debug log
                        cursor.execute("BEGIN TRANSACTION")
                        
                        # Clear existing channels
                        cursor.execute(
                            "DELETE FROM channels WHERE playlist_id = ?",
                            (playlist_id,)
                        )
                        print("Deleted existing channels")  # Debug log
                        
                        # Insert new channels
                        for i, channel in enumerate(channels):
                            try:
                                # Se il canale esisteva già, mantieni il suo tvg_id
                                tvg_id = existing_channels.get(channel.url, channel.tvg_id)
                                
                                cursor.execute(
                                    """
                                    INSERT INTO channels 
                                    (playlist_id, name, url, group_title, logo_url, tvg_id, position, extra_tags)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                    """,
                                    (playlist_id, channel.name, channel.url, channel.group, 
                                     channel.logo, tvg_id, i+1, json.dumps(channel.extra_tags))
                                )
                            except Exception as e:
                                print(f"Error inserting channel {i}: {str(e)}")  # Debug log
                                print(f"Channel data: {channel.to_dict()}")  # Debug log
                                raise
                        
                        print(f"Inserted {len(channels)} new channels")  # Debug log
                        
                        # Update last_sync
                        cursor.execute(
                            """
                            UPDATE playlists 
                            SET last_sync = CURRENT_TIMESTAMP
                            WHERE id = ?
                            """,
                            (playlist_id,)
                        )
                        
                        cursor.execute("COMMIT")
                        print("Transaction committed successfully")  # Debug log
                        
                    except Exception as e:
                        print(f"Database error: {str(e)}")  # Debug log
                        cursor.execute("ROLLBACK")
                        raise HTTPException(
                            status_code=500,
                            detail=f"Database error during sync: {str(e)}"
                        )
                    
            return {
                "message": "Playlist synchronized successfully",
                "channels_count": len(channels)
            }

@app.post("/playlists/{playlist_id}/generate-token")
async def generate_public_token(playlist_id: int):
    with get_db() as db:
        cursor = db.cursor()
        token = str(uuid.uuid4())
        
        cursor.execute(
            "UPDATE playlists SET public_token = ? WHERE id = ?",
            (token, playlist_id)
        )
        
        return {"token": token, "public_url": f"/public/playlist/{token}/m3u"}

@app.get("/public/playlist/{token}/m3u")
async def get_public_playlist(token: str):
    with get_db() as db:
        # Trova la playlist dal token pubblico
        playlist = db.execute(
            "SELECT * FROM playlists WHERE public_token = ?",
            (token,)
        ).fetchone()
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        # Prendi i canali
        channels = []
        if playlist['is_custom']:
            # Per playlist custom, usa la tabella di mapping
            rows = db.execute("""
                SELECT c.* 
                FROM channels c
                JOIN custom_playlist_channels cpc ON c.id = cpc.channel_id
                WHERE cpc.playlist_id = ?
                ORDER BY cpc.position
            """, (playlist['id'],)).fetchall()
        else:
            # Per playlist normali
            rows = db.execute("""
                SELECT * FROM channels 
                WHERE playlist_id = ?
                ORDER BY position, created_at
            """, (playlist['id'],)).fetchall()
        
        # Converti in oggetti M3UChannel
        for row in rows:
            extra_tags = row['extra_tags'] if row['extra_tags'] else {}
            channels.append(M3UChannel(
                name=row['name'],
                url=row['url'],
                group=row['group_title'],
                logo=row['logo_url'],
                tvg_id=row['tvg_id'],
                extra_tags=extra_tags
            ))
        
        # Genera il contenuto M3U
        content = generate_m3u(channels, playlist.get('epg_url'))
        
        return PlainTextResponse(content)

@app.post("/playlists/{playlist_id}/channels")
async def add_channel(playlist_id: int, channel: ChannelCreate):
    with get_db() as db:
        cursor = db.cursor()
        
        # Verifica che la playlist esista
        playlist = cursor.execute(
            "SELECT * FROM playlists WHERE id = ?",
            (playlist_id,)
        ).fetchone()
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
            
        try:
            # Trova la posizione massima attuale
            max_pos = cursor.execute(
                """
                SELECT MAX(position) as max_pos 
                FROM channels 
                WHERE playlist_id = ?
                """,
                (playlist_id,)
            ).fetchone()
            
            next_pos = (max_pos['max_pos'] or 0) + 1 if max_pos else 1
            
            # Inserisci il nuovo canale
            cursor.execute(
                """
                INSERT INTO channels 
                (playlist_id, name, url, group_title, logo_url, position, tvg_id, extra_tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (playlist_id, channel.name, channel.url, 
                 channel.group_title, channel.logo_url, next_pos,
                 channel.tvg_id, channel.extra_tags)
            )
            
            # Recupera il canale appena inserito
            new_channel = cursor.execute(
                "SELECT * FROM channels WHERE id = ?",
                (cursor.lastrowid,)
            ).fetchone()
            
            return dict(new_channel)
            
        except Exception as e:
            print(f"Error adding channel: {str(e)}")  # Debug log
            raise HTTPException(
                status_code=500,
                detail=f"Failed to add channel: {str(e)}"
            )

@app.put("/channels/{channel_id}/tvg-id")

@app.post("/playlists/{playlist_id}/add-channel/{channel_id}")
async def add_channel_to_playlist(playlist_id: int, channel_id: int):
    with get_db() as db:
        cursor = db.cursor()
        
        # Verifica che sia una playlist custom
        playlist = cursor.execute(
            "SELECT * FROM playlists WHERE id = ? AND is_custom = 1",
            (playlist_id,)
        ).fetchone()
        
        if not playlist:
            raise HTTPException(
                status_code=404,
                detail="Custom playlist not found"
            )
        
        # Verifica che il canale esista
        channel = cursor.execute(
            "SELECT * FROM channels WHERE id = ?",
            (channel_id,)
        ).fetchone()
        
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        try:
            # Trova la posizione massima attuale
            max_pos = cursor.execute(
                """
                SELECT MAX(position) as max_pos 
                FROM custom_playlist_channels 
                WHERE playlist_id = ?
                """,
                (playlist_id,)
            ).fetchone()
            
            next_pos = (max_pos['max_pos'] or 0) + 1
            
            # Aggiungi il canale
            cursor.execute(
                """
                INSERT INTO custom_playlist_channels 
                (playlist_id, channel_id, position)
                VALUES (?, ?, ?)
                """,
                (playlist_id, channel_id, next_pos)
            )
            
            return {"message": "Channel added to playlist"}
        except sqlite3.IntegrityError:
            raise HTTPException(
                status_code=400,
                detail="Channel already in playlist"
            )

@app.put("/playlists/{playlist_id}/channels/reorder")
async def reorder_channels(playlist_id: int, channel_orders: List[Dict[str, int]]):
    with get_db() as db:
        cursor = db.cursor()
        
        playlist = cursor.execute(
            "SELECT * FROM playlists WHERE id = ?",
            (playlist_id,)
        ).fetchone()
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        try:
            for order in channel_orders:
                channel_id = order['id']
                position = order['position']
                
                if playlist['is_custom']:
                    cursor.execute("""
                        UPDATE custom_playlist_channels 
                        SET position = ? 
                        WHERE playlist_id = ? AND channel_id = ?
                    """, (position, playlist_id, channel_id))
                else:
                    cursor.execute("""
                        UPDATE channels 
                        SET position = ? 
                        WHERE id = ? AND playlist_id = ?
                    """, (position, channel_id, playlist_id))
            
            return {"message": "Channels reordered successfully"}
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error reordering channels: {str(e)}"
            )

@app.put("/playlists/{playlist_id}/epg")
async def update_playlist_epg(playlist_id: int, epg_url: str):
    with get_db() as db:
        cursor = db.cursor()
        
        playlist = cursor.execute(
            "SELECT * FROM playlists WHERE id = ?",
            (playlist_id,)
        ).fetchone()
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        cursor.execute(
            "UPDATE playlists SET epg_url = ? WHERE id = ?",
            (epg_url, playlist_id)
        )
        
        return {"message": "EPG URL updated successfully"}

@app.put("/channels/{channel_id}/tvg-id")
async def update_channel_tvg_id(channel_id: int, tvg_id: str):
    with get_db() as db:
        cursor = db.cursor()
        
        channel = cursor.execute(
            "SELECT * FROM channels WHERE id = ?",
            (channel_id,)
        ).fetchone()
        
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        cursor.execute(
            "UPDATE channels SET tvg_id = ? WHERE id = ?",
            (tvg_id, channel_id)
        )
        
        return {"message": "TVG-ID updated successfully"}

@app.get("/playlists/{playlist_id}/channels-available")
async def get_available_channels(playlist_id: int):
    with get_db() as db:
        playlist = db.execute(
            "SELECT * FROM playlists WHERE id = ? AND is_custom = 1",
            (playlist_id,)
        ).fetchone()
        
        if not playlist:
            raise HTTPException(
                status_code=404,
                detail="Custom playlist not found"
            )
        
        channels = db.execute("""
            SELECT c.*, p.name as playlist_name 
            FROM channels c
            JOIN playlists p ON c.playlist_id = p.id
            WHERE c.id NOT IN (
                SELECT channel_id 
                FROM custom_playlist_channels 
                WHERE playlist_id = ?
            )
            ORDER BY p.name, c.position, c.name
        """, (playlist_id,)).fetchall()
        
        return channels

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
