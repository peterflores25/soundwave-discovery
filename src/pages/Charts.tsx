import React, { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import ChartSection from '@/components/ChartSection';
import MusicPlayer from '@/components/MusicPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getTopTracks, getCountryChart, getMockTracks } from '@/services/spotifyService';
import { toast } from '@/hooks/use-toast';
import { PlaylistData } from '@/components/Playlist';

const Charts = () => {
  const [globalCharts, setGlobalCharts] = useState<any[]>([]);
  const [usCharts, setUsCharts] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerMinimized, setPlayerMinimized] = useState(true);
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [globalTracks, usTracks] = await Promise.all([
          getTopTracks(20),
          getCountryChart('US', 20)
        ]);
        
        setGlobalCharts(globalTracks.length > 0 ? globalTracks : getMockTracks());
        setUsCharts(usTracks.length > 0 ? usTracks : getMockTracks());
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading chart data:', error);
        setGlobalCharts(getMockTracks());
        setUsCharts(getMockTracks());
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chart data. Using sample data instead."
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    // Load playlists from localStorage
    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylists);
        // Convert string dates back to Date objects
        parsedPlaylists.forEach((playlist: any) => {
          playlist.createdAt = new Date(playlist.createdAt);
        });
        setPlaylists(parsedPlaylists);
      } catch (e) {
        console.error('Error parsing playlists:', e);
      }
    }
  }, []);
  
  // Save playlists to localStorage when they change
  useEffect(() => {
    if (playlists.length > 0) {
      localStorage.setItem('playlists', JSON.stringify(playlists));
    }
  }, [playlists]);
  
  const handlePlay = (id: string) => {
    const song = [...globalCharts, ...usCharts].find(song => song.id === id);
    
    if (song) {
      if (currentSong && currentSong.id === id) {
        // Toggle play/pause for current song
        setIsPlaying(!isPlaying);
      } else {
        // Play new song
        setCurrentSong(song);
        setIsPlaying(true);
        setPlayerMinimized(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to play this song."
      });
    }
  };
  
  const handleSelectPlaylist = (playlistId: string, song: any) => {
    // Find the playlist by ID
    const targetPlaylistIndex = playlists.findIndex(p => p.id === playlistId);
    
    if (targetPlaylistIndex === -1) return;
    
    // Check if song already exists in the playlist
    if (playlists[targetPlaylistIndex].tracks.some(t => t.id === song.id)) {
      toast({
        description: `"${song.title}" est déjà dans cette playlist`
      });
      return;
    }
    
    // Add song to the selected playlist
    const updatedPlaylists = [...playlists];
    updatedPlaylists[targetPlaylistIndex].tracks.push(song);
    setPlaylists(updatedPlaylists);
  };
  
  const handleAddToPlaylist = (song: any) => {
    if (playlists.length === 0) {
      // If no playlists exist, create a default one
      const newPlaylist: PlaylistData = {
        id: Date.now().toString(),
        name: 'Ma Playlist',
        description: 'Créée à partir des morceaux favoris',
        coverImage: song.albumArt,
        tracks: [song],
        createdAt: new Date()
      };
      
      setPlaylists([newPlaylist]);
      
      toast({
        title: "Nouvelle playlist créée",
        description: `"${song.title}" ajouté à "Ma Playlist"`
      });
    } else {
      toast({
        description: "Veuillez sélectionner une playlist existante",
      });
    }
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleNext = () => {
    if (!currentSong) return;
    
    const allSongs = [...globalCharts, ...usCharts];
    const currentIndex = allSongs.findIndex(song => song.id === currentSong.id);
    
    if (currentIndex > -1 && currentIndex < allSongs.length - 1) {
      setCurrentSong(allSongs[currentIndex + 1]);
      setIsPlaying(true);
    }
  };
  
  const handlePrevious = () => {
    if (!currentSong) return;
    
    const allSongs = [...globalCharts, ...usCharts];
    const currentIndex = allSongs.findIndex(song => song.id === currentSong.id);
    
    if (currentIndex > 0) {
      setCurrentSong(allSongs[currentIndex - 1]);
      setIsPlaying(true);
    }
  };
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <Hero 
        title="Charts"
        subtitle="Discover the most popular music from around the world"
        className="min-h-[50vh]"
      />
      
      <div className="pb-24 md:pb-32">
        {loading ? (
          <LoadingSpinner message="Loading chart data..." />
        ) : (
          <>
            <ChartSection 
              title="Global Top 20"
              description="The most popular songs on Spotify worldwide"
              songs={globalCharts} 
              onPlay={handlePlay} 
              currentlyPlaying={isPlaying ? currentSong?.id : undefined}
              type="list"
              onAddToPlaylist={handleAddToPlaylist}
              playlists={playlists}
              onSelectPlaylist={handleSelectPlaylist}
            />
            
            <ChartSection 
              title="United States Top 20"
              description="The hottest tracks in the United States"
              songs={usCharts} 
              onPlay={handlePlay} 
              currentlyPlaying={isPlaying ? currentSong?.id : undefined}
              className="mt-12"
              type="list"
              onAddToPlaylist={handleAddToPlaylist}
              playlists={playlists}
              onSelectPlaylist={handleSelectPlaylist}
            />
          </>
        )}
      </div>
      
      {currentSong && (
        <MusicPlayer 
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          minimized={playerMinimized}
          onToggleMinimize={() => setPlayerMinimized(!playerMinimized)}
        />
      )}
    </div>
  );
};

export default Charts;
