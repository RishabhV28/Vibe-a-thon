import { useState, useRef, useEffect } from "react";
import { Mic, X, Volume2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface VoiceResponse {
  intent: "search" | "info" | "negotiate";
  filters: {
    brand?: string;
    size?: string;
    condition?: string;
    maxPrice?: number;
  };
  response: string;
  productRecommendations: number[];
  matchingProducts?: any[];
}

export default function VoiceAssistant() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          handleVoiceCommand(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Voice Recognition Error",
            description: "Please try again or check your microphone permissions.",
            variant: "destructive",
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    setIsListening(true);
    setTranscript("");
    setAiResponse("");
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice commands.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceCommand = async (voiceText: string) => {
    setIsProcessing(true);
    
    try {
      const response = await apiRequest("POST", "/api/voice/process", {
        query: voiceText
      });
      
      const result: VoiceResponse = await response.json();
      setAiResponse(result.response);

      // Handle different intents
      if (result.intent === "search" && result.matchingProducts && result.matchingProducts.length > 0) {
        // Apply search filters based on AI understanding
        const searchParams = new URLSearchParams();
        if (result.filters.brand) searchParams.set('brand', result.filters.brand);
        if (result.filters.size) searchParams.set('size', result.filters.size);
        if (result.filters.condition) searchParams.set('condition', result.filters.condition);
        if (result.filters.maxPrice) searchParams.set('maxPrice', result.filters.maxPrice.toString());

        // Close modal and navigate with filters
        setTimeout(() => {
          setIsModalOpen(false);
          setLocation(`/?${searchParams.toString()}`);
        }, 2000);
      }

      // Generate speech response
      await handleTextToSpeech(result.response);

    } catch (error) {
      console.error('Voice processing error:', error);
      setAiResponse("Sorry, I couldn't process your request. Please try again.");
      toast({
        title: "AI Processing Error",
        description: "Failed to understand your voice command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    try {
      setIsPlaying(true);
      
      const response = await apiRequest("POST", "/api/voice/speak", {
        text: text
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
        }
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <>
      {/* Hidden audio element for speech playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Floating Voice Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-accent-foreground w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          size="lg"
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>

      {/* Voice Assistant Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-secondary max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-space font-semibold text-accent">
                AI Deal Assistant
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {/* Voice Waveform Animation */}
          <div className="flex justify-center mb-6">
            <div className="flex items-end space-x-1 h-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`bg-accent w-1 rounded transition-all duration-300 ${
                    isListening || isProcessing
                      ? "animate-pulse h-full" 
                      : "h-4"
                  }`}
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    height: isListening || isProcessing ? `${Math.random() * 40 + 10}px` : "16px"
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Transcript Display */}
          {transcript && (
            <div className="bg-muted rounded-lg p-3 mb-4">
              <p className="text-sm">
                <span className="text-muted-foreground">You said:</span>
                <br />
                <span className="text-foreground">"{transcript}"</span>
              </p>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <div className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-1">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{aiResponse}</p>
                  {isPlaying && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Volume2 className="h-3 w-3 animate-pulse" />
                      Speaking...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center space-y-4">
            {!transcript && (
              <>
                <p className="text-muted-foreground">Say something like:</p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground italic">
                    "Find me the best deal on Jordan 1 Retro High in size 10"
                  </p>
                </div>
              </>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={handleStartListening}
                disabled={isListening || isProcessing}
                className="flex-1"
                size="lg"
              >
                <Mic className="h-4 w-4 mr-2" />
                {isListening ? "Listening..." : isProcessing ? "Processing..." : "Start Listening"}
              </Button>
              
              {aiResponse && (
                <Button
                  variant="outline"
                  onClick={() => handleTextToSpeech(aiResponse)}
                  disabled={isPlaying}
                  size="lg"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {isListening && (
              <p className="text-sm text-muted-foreground animate-pulse">
                🎤 Speak now, I'm listening for your sneaker request...
              </p>
            )}

            {isProcessing && (
              <p className="text-sm text-muted-foreground animate-pulse">
                🤖 Processing your request with AI...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
