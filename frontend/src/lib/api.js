const API_URL = 'http://localhost:8000';

export async function getPlaylists() {
    const response = await fetch(`${API_URL}/playlists`);
    if (!response.ok) {
        throw new Error('Failed to fetch playlists');
    }
    return response.json();
}

export async function getPlaylist(id) {
    const response = await fetch(`${API_URL}/playlists/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch playlist');
    }
    return response.json();
}

export async function createPlaylist(data) {
    const response = await fetch(`${API_URL}/playlists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create playlist');
    }
    return response.json();
}

export async function updatePlaylist(id, data) {
    const response = await fetch(`${API_URL}/playlists/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update playlist');
    }
    return response.json();
}

export async function deletePlaylist(id) {
    const response = await fetch(`${API_URL}/playlists/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete playlist');
    }
    return response.json();
}

export async function syncPlaylist(id) {
    const response = await fetch(`${API_URL}/playlists/${id}/sync`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to sync playlist');
    }
    return response.json();
}

export async function addChannel(playlistId, channelData) {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/channels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
    });
    if (!response.ok) {
        throw new Error('Failed to add channel');
    }
    return response.json();
}

export async function updateChannel(channelId, channelData) {
    const response = await fetch(`${API_URL}/channels/${channelId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
    });
    if (!response.ok) {
        throw new Error('Failed to update channel');
    }
    return response.json();
}

export async function deleteChannel(channelId) {
    const response = await fetch(`${API_URL}/channels/${channelId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete channel');
    }
    return response.json();
}

export async function getPlaylistM3U(id) {
    const response = await fetch(`${API_URL}/playlists/${id}/m3u`);
    if (!response.ok) {
        throw new Error('Failed to fetch M3U');
    }
    return response.text();
}
