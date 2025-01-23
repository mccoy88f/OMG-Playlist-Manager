from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List, Dict
from datetime import datetime

# Auth models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: str

class User(BaseModel):
    id: int
    username: str
    created_at: datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserInDB(User):
    password_hash: str

# Playlist models
class PlaylistBase(BaseModel):
    name: str
    url: Optional[str] = None
    is_custom: bool = False
    epg_url: Optional[str] = None

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    epg_url: Optional[str] = None

# Channel models
class ChannelBase(BaseModel):
    name: str
    url: str
    group_title: Optional[str] = None
    logo_url: Optional[str] = None
    tvg_id: Optional[str] = None
    position: Optional[int] = None
    extra_tags: Optional[Dict[str, str]] = Field(default_factory=dict)

class ChannelCreate(ChannelBase):
    pass

class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    group_title: Optional[str] = None
    logo_url: Optional[str] = None
    tvg_id: Optional[str] = None
    extra_tags: Optional[Dict[str, str]] = None

class Channel(ChannelBase):
    id: int
    playlist_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Complete Playlist model (includes channels)
class Playlist(PlaylistBase):
    id: int
    user_id: int
    public_token: Optional[str] = None
    last_sync: Optional[datetime] = None
    created_at: datetime
    channels: List[Channel] = []

    class Config:
        from_attributes = True

# Channel Order Update
class ChannelOrder(BaseModel):
    id: int
    position: int

# Custom Playlist Channel Add
class CustomPlaylistChannelAdd(BaseModel):
    channel_id: int
    position: Optional[int] = None
