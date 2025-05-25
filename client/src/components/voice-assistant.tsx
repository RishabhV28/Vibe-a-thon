import { useState } from "react";
import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function VoiceAssistant() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleStartListening = () => {
    setIsListening(true);
    // Simulate listening animation
    setTimeout(() => {
      setIsListening(false);
      // Here would be where you'd handle the voice input
    }, 3000);
  };

  return (
    <>
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
                    isListening 
                      ? "animate-pulse h-full" 
                      : "h-4"
                  }`}
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    height: isListening ? `${Math.random() * 40 + 10}px` : "16px"
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Say something like:</p>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground italic">
                "Find me the best deal on Jordan 1 Retro High in size 10"
              </p>
            </div>
            
            <Button
              onClick={handleStartListening}
              disabled={isListening}
              className="w-full"
              size="lg"
            >
              {isListening ? "Listening..." : "Start Listening"}
            </Button>
            
            {isListening && (
              <p className="text-sm text-muted-foreground">
                Speak now, I'm listening for your sneaker request...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
