import React, { useState, useEffect } from 'react';
import { Play, Pause, Info, Volume2, VolumeX } from 'lucide-react';
import * as Tone from 'tone';

type Planet = 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

const PlanetaryPolyrhythm = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [synth, setSynth] = useState<any>(null);
  
  // Original orbital periods in Earth days
  const orbitalPeriods: Record<Planet, number> = {
    Mercury: 88,
    Venus: 224.7,
    Earth: 365.2,
    Mars: 687.0,
    Jupiter: 4332,
    Saturn: 10760,
    Uranus: 30700,
    Neptune: 60200,
    Pluto: 90600
  };
  
  // Simplified rhythmic ratios for inner planets
  const rhythmRatios: Record<Planet, number> = {
    Mercury: 1,
    Venus: 3,
    Earth: 4, 
    Mars: 8,
    Jupiter: 12,
    Saturn: 16,
    Uranus: 16,
    Neptune: 16,
    Pluto: 16
  };
  
  // G Major scale notes for each planet
  const planetNotes: Partial<Record<Planet, string>> = {
    Mercury: "G4",   // G
    Venus: "B4",     // B
    Earth: "D5",     // D
    Mars: "A4",      // A
    Jupiter: "E5",   // E
    Saturn: "G5",    // G (octave higher)
    Uranus: "B5",    // B (octave higher)
    Neptune: "D6",   // D (octave higher)
    Pluto: "A5"      // A (octave higher)
  };
  
  // Colors for each planet
  const planetColors: Record<Planet, string> = {
    Mercury: "#E5E5E5", // Light grey
    Venus: "#F5DEB3",   // Wheat/tan
    Earth: "#4169E1",   // Royal blue
    Mars: "#CD5C5C",    // Indian red
    Jupiter: "#FFA500", // Orange
    Saturn: "#F0E68C",  // Khaki
    Uranus: "#ADD8E6",  // Light blue
    Neptune: "#4682B4", // Steel blue
    Pluto: "#8B4513"    // Saddle brown
  };

  // Total cycle length
  const cycleLength = 24;
  
  // Initialize Tone.js
  useEffect(() => {
    // Create a polyphonic synth
    const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    newSynth.set({
      volume: -10,
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    });
    setSynth(newSynth);
    
    // Clean up
    return () => {
      if ((window as any).intervalId) {
        clearInterval((window as any).intervalId);
      }
      newSynth.dispose();
    };
  }, []);
  
  // Effect to play sounds when current beat changes
  useEffect(() => {
    if (isPlaying && synth && !isMuted) {
      // Check which planets should play on the current beat
      Object.keys(planetNotes).forEach(planet => {
        if (currentBeat % rhythmRatios[planet as Planet] === 0) {
          // Play the note for this planet
          synth.triggerAttackRelease(planetNotes[planet as Planet], "8n");
        }
      });
    }
  }, [currentBeat, isPlaying, synth, isMuted]);

  // Generate rhythm pattern for a planet
  const generatePattern = (ratio: number) => {
    const pattern = [];
    for (let i = 0; i < cycleLength; i++) {
      pattern.push(i % ratio === 0);
    }
    return pattern;
  };

  // Calculate patterns for each planet
  const patterns = (Object.keys(rhythmRatios) as Planet[]).reduce((acc, planet) => {
    acc[planet] = generatePattern(rhythmRatios[planet]);
    return acc;
  }, {} as Record<Planet, boolean[]>);

  // Toggle play/pause
  const togglePlay = () => {
    // Start audio context if it's not running
    if (Tone.context.state !== 'running') {
      Tone.start();
    }
    
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const intervalId = setInterval(() => {
        setCurrentBeat(prev => (prev + 1) % cycleLength);
      }, 60000 / tempo / 4); // 16th notes at given tempo
      
      (window as any).intervalId = intervalId;
    } else {
      clearInterval((window as any).intervalId);
    }
  };

  // Handle tempo change
  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value);
    setTempo(newTempo);
    
    if (isPlaying) {
      clearInterval((window as any).intervalId);
      const intervalId = setInterval(() => {
        setCurrentBeat(prev => (prev + 1) % cycleLength);
      }, 60000 / newTempo / 4);
      
      (window as any).intervalId = intervalId;
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white p-6 rounded-lg w-full">
      <div className="flex flex-row justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Planetary Orbit Polyrhythm</h1>
        <div className="flex items-center">
          <button 
            onClick={toggleMute}
            className="text-gray-300 hover:text-white mr-4"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-gray-300 hover:text-white"
          >
            <Info size={20} />
          </button>
        </div>
      </div>
      
      {showExplanation && (
        <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm">
          <p className="mb-2">This visualization plays the orbital periods of planets as musical notes in a G major scale:</p>
          <ul className="list-disc pl-5 mb-2">
            <li>Mercury: G note (1:1 rhythm - plays every beat)</li>
            <li>Venus: B note (3:1 rhythm)</li>
            <li>Earth: D note (4:1 rhythm)</li>
            <li>Mars: A note (8:1 rhythm)</li>
            <li>Jupiter: E note (12:1 rhythm)</li>
            <li>Saturn: G note (16:1 rhythm - octave higher)</li>
            <li>Uranus: B note (16:1 rhythm - octave higher)</li>
            <li>Neptune: D note (16:1 rhythm - octave higher)</li>
            <li>Pluto: A note (16:1 rhythm - octave higher)</li>
          </ul>
          <p className="mt-2">Together, they create a harmonic polyrhythm that represents the cosmic "music of the spheres".</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={togglePlay}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
        
        <div className="flex items-center">
          <span className="mr-2">Tempo:</span>
          <input 
            type="range" 
            min="40" 
            max="240" 
            value={tempo} 
            onChange={handleTempoChange}
            className="w-32"
          />
          <span className="ml-2">{tempo} BPM</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {Object.keys(planetNotes).map(planet => (
          <div key={planet} className="flex flex-col">
            <div className="flex items-center mb-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{backgroundColor: planetColors[planet as Planet]}}
              ></div>
              <span className="w-16">{planet}</span>
              <span className="text-gray-400 text-xs ml-2">
                {orbitalPeriods[planet as Planet]} days = {rhythmRatios[planet as Planet]}:1 ratio | Note: {planetNotes[planet as Planet]}
              </span>
            </div>
            <div className="flex overflow-x-auto pb-2">
              {patterns[planet as Planet].map((active, i) => (
                <div 
                  key={i}
                  className={`w-6 h-6 mx-1 rounded-full flex items-center justify-center transition-all duration-150 ${
                    i === currentBeat ? 'border-2 border-white' : ''
                  }`}
                  style={{
                    backgroundColor: active 
                      ? (i === currentBeat ? `${planetColors[planet as Planet]}` : `${planetColors[planet as Planet]}80`) 
                      : 'transparent',
                    opacity: active ? 1 : 0.2
                  }}
                >
                  {active && <div className="text-xs">{i+1}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanetaryPolyrhythm; 