from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict
from datetime import datetime

class PlaylistCreate(BaseModel):
    name: str
    url: Optional[str] = None
    is_custom: bool = False

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    epg_url: Optional[str] = None

class Channel(BaseModel):
    id: int
    playlist_id: int
    name: str
    url: str
    group_title: Optional[str] = None
    logo_url: Optional[str] = None
    tvg_id: Optional[str] = None
    position: Optional[int] = None
    extra_tags: Optional[Dict[str, str]] = None
    created_at: datetime

class Playlist(BaseModel):
    id: int
    name: str
    url: Optional[str] = None
    is_custom: bool
    public_token: Optional[str] = None
    epg_url: Optional[str] = None
    last_sync: Optional[datetime] = None
    created_at: datetime
    channels: List[Channel] = []

class ChannelCreate(BaseModel):
    name: str
    url: str
    group_title: Optional[str] = None
    logo_url: Optional[str] = None
    tvg_id: Optional[str] = None
    extra_tags: Optional[Dict[str, str]] = None

class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    group_title: Optional[str] = None
    logo_url: Optional[str] = None
    tvg_id: Optional[str] = None
    extra_tags: Optional[Dict[str, str]] = None
