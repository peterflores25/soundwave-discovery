
import React from 'react';
import { PlaylistData } from './Playlist';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, ListMusic } from 'lucide-react';

interface PlaylistSelectorProps {
  song: {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    duration: string;
  };
  playlists: PlaylistData[];
  onCreateNewPlaylist?: (song: any) => void;
  onSelectPlaylist: (playlistId: string, song: any) => void;
  children: React.ReactNode;
}

const PlaylistSelector = ({ 
  song, 
  playlists,
  onCreateNewPlaylist,
  onSelectPlaylist,
  children 
}: PlaylistSelectorProps) => {
  const handleSelectPlaylist = (playlistId: string) => {
    onSelectPlaylist(playlistId, song);
    
    // Find the playlist name for the toast message
    const selectedPlaylist = playlists.find(p => p.id === playlistId);
    if (selectedPlaylist) {
      toast({
        description: `"${song.title}" a été ajouté à "${selectedPlaylist.name}"`,
      });
    }
  };
  
  const handleCreatePlaylist = () => {
    if (onCreateNewPlaylist) {
      onCreateNewPlaylist(song);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ajouter à la playlist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <DropdownMenuItem 
              key={playlist.id}
              onClick={() => handleSelectPlaylist(playlist.id)}
              className="flex items-center cursor-pointer"
            >
              {playlist.coverImage ? (
                <img 
                  src={playlist.coverImage} 
                  alt={playlist.name} 
                  className="w-5 h-5 rounded mr-2"
                />
              ) : (
                <ListMusic className="h-4 w-4 mr-2" />
              )}
              <span className="truncate">{playlist.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">Aucune playlist</div>
        )}
        
        {onCreateNewPlaylist && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleCreatePlaylist}
              className="flex items-center cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Créer une nouvelle playlist
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PlaylistSelector;
