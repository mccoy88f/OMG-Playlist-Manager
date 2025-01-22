from typing import List, Dict, Optional
import re

class M3UChannel:
    def __init__(self, name: str, url: str, group: Optional[str] = None, 
                 logo: Optional[str] = None, tvg_id: Optional[str] = None,
                 extra_tags: Optional[Dict[str, str]] = None):
        self.name = name
        self.url = url
        self.group = group
        self.logo = logo
        self.tvg_id = tvg_id
        self.extra_tags = extra_tags or {}

    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "url": self.url,
            "group": self.group,
            "logo": self.logo,
            "tvg_id": self.tvg_id,
            "extra_tags": self.extra_tags
        }

def parse_m3u(content: str) -> List[M3UChannel]:
    """Parse M3U content and return a list of channels"""
    channels = []
    current_channel = None
    extra_tags = {}
    
    # Tieni traccia della posizione per l'ordinamento
    position = 0
    
    for line in content.splitlines():
        line = line.strip()
        
        if not line:
            continue

        if line.startswith('#EXTM3U'):
            # Cerca l'URL dell'EPG se presente
            epg_match = re.search(r'x-tvg-url="([^"]+)"', line)
            if epg_match:
                extra_tags['epg_url'] = epg_match.group(1)
            continue
            
        if line.startswith('#EXTINF:'):
            position += 1  # Incrementa la posizione per ogni nuovo canale
            # Parse channel info
            info = line[8:]  # Remove '#EXTINF:'
            
            # Extract duration if present
            duration_match = re.match(r'-?\d+', info)
            if duration_match:
                info = info[len(duration_match.group(0)):].strip(',').strip()
            
            # Parse attributes
            attributes = {}
            if 'tvg-' in info or 'group-' in info:
                attrs_pattern = r'([\w-]+)="([^"]*)"'
                for match in re.finditer(attrs_pattern, info):
                    key, value = match.groups()
                    attributes[key] = value
                
                # Remove attributes from info string
                info = re.sub(r'[\w-]+="[^"]*"', '', info).strip()
            
            # The remaining info is the channel name
            name = info.strip()
            if name.startswith(','):
                name = name[1:].strip()
            
            current_channel = {
                'name': name,
                'group': attributes.get('group-title'),
                'logo': attributes.get('tvg-logo'),
                'tvg_id': attributes.get('tvg-id'),
                'position': position,
                'extra_tags': extra_tags.copy()
            }
            extra_tags = {}  # Reset for next channel
            
        elif line.startswith('#EXTGRP:'):
            if current_channel:
                current_channel['group'] = line[8:].strip()
        
        # Gestione tag aggiuntivi
        elif line.startswith('#'):
            tag_match = re.match(r'#([^:]+):(.+)', line)
            if tag_match:
                tag_name, tag_value = tag_match.groups()
                extra_tags[tag_name] = tag_value.strip()
                
        elif not line.startswith('#') and line:
            if current_channel:
                channels.append(M3UChannel(
                    name=current_channel['name'],
                    url=line,
                    group=current_channel['group'],
                    logo=current_channel['logo'],
                    tvg_id=current_channel['tvg_id'],
                    extra_tags=current_channel['extra_tags']
                ))
            current_channel = None
            extra_tags = {}  # Reset for next channel

    return channels

def generate_m3u(channels: List[M3UChannel], epg_url: Optional[str] = None) -> str:
    """Generate M3U content from a list of channels"""
    content = []
    
    # Aggiungi header con EPG se presente
    if epg_url:
        content.append(f'#EXTM3U x-tvg-url="{epg_url}"')
    else:
        content.append('#EXTM3U')
    
    for channel in channels:
        # Add extra tags first
        for tag_name, tag_value in channel.extra_tags.items():
            if tag_name != 'epg_url':  # Skip EPG URL as it's handled in the header
                content.append(f'#{tag_name}:{tag_value}')
            
        # Add standard attributes
        attributes = []
        if channel.tvg_id:
            attributes.append(f'tvg-id="{channel.tvg_id}"')
        if channel.group:
            attributes.append(f'group-title="{channel.group}"')
        if channel.logo:
            attributes.append(f'tvg-logo="{channel.logo}"')
            
        attrs_str = ' '.join(attributes)
        if attrs_str:
            attrs_str = ' ' + attrs_str
            
        content.append(f'#EXTINF:-1{attrs_str},{channel.name}')
        content.append(channel.url)
    
    return '\n'.join(content)
