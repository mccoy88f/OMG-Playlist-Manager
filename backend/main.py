from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from typing import List
import aiohttp
import asyncio
from datetime import datetime

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

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Playlist routes
@app.get("/playlists", response_model=List[Playlist])
async def get_playlists():
    db = get_db()
    cursor = db.cursor()
    
    # Get all playlists with their channels
    playlists = []
    for playlist in cursor.execute("SELECT * FROM playlists").fetchall():
        channels = cursor.execute(
            "SELECT * FROM channels WHERE playlist_id = ?",
            (playlist['id'],)
        ).fetchall()
        
        playlist_dict = dict(playlist)
        playlist_dict['channels'] = [dict(ch) for ch in channels]
        playlists.append(playlist_dict)
    
    return playlists

@app.post("/playlists", response_model=Playlist)
async def create_playlist(playlist: PlaylistCreate):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute(
        """
        INSERT INTO playlists (name, url, is_custom)
        VALUES (?, ?, ?)
        """,
        (playlist.name, playlist.url, playlist.is_custom)
    )
    db.commit()
    
    new_playlist = cursor.execute(
        "SELECT * FROM playlists WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()
    
    return dict(new_playlist)

@app.get("/playlists/{playlist_id}", response_model=Playlist)
async def get_playlist(playlist_id: int):
    db = get_db()
    playlist = db.execute(
        "SELECT * FROM playlists WHERE id = ?",
        (playlist_id,)
    ).fetchone()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    channels = db.execute(
        "SELECT * FROM channels WHERE playlist_id = ?",
        (playlist_id,)
    ).fetchall()
    
    playlist_dict = dict(playlist)
    playlist_dict['channels'] = [dict(ch) for ch in channels]
    return playlist_dict

@app.put("/playlists/{playlist_id}", response_model=Playlist)
async def update_playlist(playlist_id: int, playlist: PlaylistUpdate):
    db = get_db()
    cursor = db.cursor()
    
    # Check if playlist exists
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
        db.commit()
    
    return await get_playlist(playlist_id)

@app.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: int):
    db = get_db()
    cursor = db.cursor()
    
    playlist = cursor.execute(
        "SELECT * FROM playlists WHERE id = ?",
        (playlist_id,)
    ).fetchone()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    cursor.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
    db.commit()
    
    return {"message": "Playlist deleted"}

@app.post("/playlists/{playlist_id}/sync")
async def sync_playlist(playlist_id: int):
    db = get_db()
    cursor = db.cursor()
    
    playlist = cursor.execute(
        "SELECT * FROM playlists WHERE id = ?",
        (playlist_id,)
    ).fetchone()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if not playlist['url']:
        raise HTTPException(status_code=400, detail="Playlist has no URL")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(playlist['url']) as response:
                content = await response.text()
                channels = parse_m3u(content)
                
                # Clear existing channels
                cursor.execute(
                    "DELETE FROM channels WHERE playlist_id = ?",
                    (playlist_id,)
                )
                
                # Insert new channels
                for channel in channels:
                    cursor.execute(
                        """
                        INSERT INTO channels 
                        (playlist_id, name, url, group_title, logo_url)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (playlist_id, channel.name, channel.url, 
                         channel.group, channel.logo)
                    )
                
                # Update last_sync
                cursor.execute(
                    """
                    UPDATE playlists 
                    SET last_sync = CURRENT_TIMESTAMP
                    WHERE id = ?
                    """,
                    (playlist_id,)
                )
                
                db.commit()
                
        return {"message": "Playlist synchronized successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error syncing playlist: {str(e)}"
        )

@app.get("/playlists/{playlist_id}/m3u")
async def get_playlist_m3u(playlist_id: int):
    db = get_db()
    
    # Check if playlist exists
    playlist = db.execute(
        "SELECT * FROM playlists WHERE id = ?",
        (playlist_id,)
    ).fetchone()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Get channels
    channels = db.execute(
        "SELECT * FROM channels WHERE playlist_id = ?",
        (playlist_id,)
    ).fetchall()
    
    # Convert to M3UChannel objects
    m3u_channels = [
        M3UChannel(
            name=ch['name'],
            url=ch['url'],
            group=ch['group_title'],
            logo=ch['logo_url']
        )
        for ch in channels
    ]
    
    # Generate M3U content
    content = generate_m3u(m3u_channels)
    
    return PlainTextResponse(content)

# Channel routes
@app.get("/channels", response_model=List[Channel])
async def get_channels():
    db = get_db()
    channels = db.execute("SELECT * FROM channels").fetchall()
    return [dict(ch) for ch in channels]

@app.post("/playlists/{playlist_id}/channels", response_model=Channel)
async def add_channel(playlist_id: int, channel: ChannelCreate):
    db = get_db()
    cursor = db.cursor()
    
    # Check if playlist exists
    playlist = cursor.execute(
        "SELECT * FROM playlists WHERE id = ?",
        (playlist_id,)
    ).fetchone()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    cursor.execute(
        """
        INSERT INTO channels 
        (playlist_id, name, url, group_title, logo_url)
        VALUES (?, ?, ?, ?, ?)
        """,
        (playlist_id, channel.name, channel.url, 
         channel.group_title, channel.logo_url)
    )
    db.commit()
    
    new_channel = cursor.execute(
        "SELECT * FROM channels WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()
    
    return dict(new_channel)

@app.put("/channels/{channel_id}", response_model=Channel)
async def update_channel(channel_id: int, channel: ChannelUpdate):
    db = get_db()
    cursor = db.cursor()
    
    # Check if channel exists
    existing = cursor.execute(
        "SELECT * FROM channels WHERE id = ?",
        (channel_id,)
    ).fetchone()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Update only provided fields
    update_fields = []
    values = []
    if channel.name is not None:
        update_fields.append("name = ?")
        values.append(channel.name)
    if channel.url is not None:
        update_fields.append("url = ?")
        values.append(channel.url)
    if channel.group_title is not None:
        update_fields.append("group_title = ?")
        values.append(channel.group_title)
    if channel.logo_url is not None:
        update_fields.append("logo_url = ?")
        values.append(channel.logo_url)
    
    if update_fields:
        values.append(channel_id)
        cursor.execute(
            f"""
            UPDATE channels 
            SET {', '.join(update_fields)}
            WHERE id = ?
            """,
            tuple(values)
        )
        db.commit()
    
    updated = cursor.execute(
        "SELECT * FROM channels WHERE id = ?",
        (channel_id,)
    ).fetchone()
    
    return dict(updated)

@app.delete("/channels/{channel_id}")
async def delete_channel(channel_id: int):
    db = get_db()
    cursor = db.cursor()
    
    channel = cursor.execute(
        "SELECT * FROM channels WHERE id = ?",
        (channel_id,)
    ).fetchone()
    
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    cursor.execute("DELETE FROM channels WHERE id = ?", (channel_id,))
    db.commit()
    
    return {"message": "Channel deleted"}

# Custom playlist routes
@app.post("/custom-playlists", response_model=Playlist)
async def create_custom_playlist(playlist: PlaylistCreate):
    if not playlist.is_custom:
        raise HTTPException(
            status_code=400,
            detail="is_custom must be True for custom playlists"
        )
    
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute(
        """
        INSERT INTO playlists (name, is_custom)
        VALUES (?, TRUE)
        """,
        (playlist.name,)
    )
    db.commit()
    
    new_playlist = cursor.execute(
        "SELECT * FROM playlists WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()
    
    return dict(new_playlist)

@app.post("/custom-playlists/{playlist_id}/channels/{channel_id}")
async def add_channel_to_custom_playlist(
    playlist_id: int,
    channel_id: int,
    position: int = None
):
    db = get_db()
    cursor = db.cursor()
    
    # Check if playlist is custom
    playlist = cursor.execute(
        "SELECT * FROM playlists WHERE id = ? AND is_custom = TRUE",
        (playlist_id,)
    ).fetchone()
    
    if not playlist:
        raise HTTPException(
            status_code=404,
            detail="Custom playlist not found"
        )
    
    # Check if channel exists
    channel = cursor.execute(
        "SELECT * FROM channels WHERE id = ?",
        (channel_id,)
    ).fetchone()
    
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    try:
        cursor.execute(
            """
            INSERT INTO custom_playlist_channels 
            (playlist_id, channel_id, position)
            VALUES (?, ?, ?)
            """,
            (playlist_id, channel_id, position)
        )
        db.commit()
        return {"message": "Channel added to custom playlist"}
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Channel already in playlist"
        )

@app.delete("/custom-playlists/{playlist_id}/channels/{channel_id}")
async def remove_channel_from_custom_playlist(
    playlist_id: int,
    channel_id: int
):
    db = get_db()
    cursor = db.cursor()
    
    # Check if mapping exists
    mapping = cursor.execute(
        """
        SELECT * FROM custom_playlist_channels 
        WHERE playlist_id = ? AND channel_id = ?
        """,
        (playlist_id, channel_id)
    ).fetchone()
    
    if not mapping:
        raise HTTPException(
            status_code=404,
            detail="Channel not found in custom playlist"
        )
    
    cursor.execute(
        """
        DELETE FROM custom_playlist_channels 
        WHERE playlist_id = ? AND channel_id = ?
        """,
        (playlist_id, channel_id)
    )
    db.commit()
    
    return {"message": "Channel removed from custom playlist"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
