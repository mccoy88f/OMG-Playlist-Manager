from typing import List, Dict, Optional
import re

class M3UChannel:
    def __init__(self, name: str, url: str, group: Optional[str] = None, logo: Optional[str] = None):
        self.name = name
        self.url = url
        self.group = group
        self.logo = logo

    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "url": self.url,
            "group": self.group,
            "logo": self.logo
        }

def parse_m3u(content: str) -> List[M3UChannel]:
    """Parse M3U content and return a list of channels"""
    channels = []
    current_channel = None
    
    for line in content.splitlines():
        line = line.strip()
        
        if not line:
            continue
            
        if line.startswith('#EXTINF:'):
            # Parse channel info
            info = line[8:]  # Remove '#EXTINF:'
            
            # Extract duration if present
            duration_match = re.match(r'-?\d+', info)
            if duration_match:
                info = info[len(duration_match.group(0)):].strip(',').strip()
            
            # Parse attributes
            attributes = {}
            if 'tvg-' in info:
                # Extract known attributes
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
                'logo': attributes.get('tvg-logo')
            }
            
        elif line.startswith('#EXTGRP:'):
            if current_channel:
                current_channel['group'] = line[8:].strip()
                
        elif not line.startswith('#'):
            if current_channel and line:
                channels.append(M3UChannel(
                    name=current_channel['name'],
                    url=line,
                    group=current_channel['group'],
                    logo=current_channel['logo']
                ))
            current_channel = None

    return channels

def generate_m3u(channels: List[M3UChannel]) -> str:
    """Generate M3U content from a list of channels"""
    content = ['#EXTM3U']
    
    for channel in channels:
        attributes = []
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
