import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function BarcodeScanner({ onScan, isActive }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      // Stop scanning when not active
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      try {
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Kamera-API nicht verfügbar. Nutzen Sie HTTPS oder localhost.');
          return;
        }

        // Request camera permission with optimized settings
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            focusMode: 'continuous',
            advanced: [
              { focusMode: 'continuous' },
              { zoom: 1.5 }
            ]
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        // Check if torch (flashlight) is supported
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
          setTorchSupported(true);
        }

        setHasPermission(true);
        setError(null);

        // Start decoding from video device
        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              const scannedText = result.getText();
              onScan(scannedText);
              // Stop scanning after successful scan
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
              }
              codeReader.reset();
            }
            if (err && err.name !== 'NotFoundException') {
              console.error(err);
            }
          }
        );
      } catch (err) {
        console.error('Scanner error:', err);

        let errorMessage = 'Kamera-Zugriff nicht möglich';

        if (err.name === 'NotAllowedError') {
          errorMessage = 'Kamera-Zugriff wurde verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Keine Kamera gefunden. Nutzen Sie stattdessen die manuelle Eingabe.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Kamera wird bereits verwendet oder ist nicht verfügbar.';
        } else if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
          errorMessage = 'Kamera-Zugriff erfordert HTTPS. Nutzen Sie ngrok oder die manuelle Eingabe.';
        }

        setError(errorMessage);
      }
    };

    startScanning();

    // Cleanup function
    return () => {
      // Turn off torch before stopping stream
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        try {
          track.applyConstraints({ advanced: [{ torch: false }] });
        } catch (err) {
          // Ignore errors on cleanup
        }
      }

      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setTorchEnabled(false);
    };
  }, [isActive, onScan]);

  const toggleTorch = async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    const newTorchState = !torchEnabled;

    try {
      await track.applyConstraints({
        advanced: [{ torch: newTorchState }]
      });
      setTorchEnabled(newTorchState);
    } catch (err) {
      console.error('Torch toggle failed:', err);
      // Fallback method
      try {
        await track.applyConstraints({
          torch: newTorchState
        });
        setTorchEnabled(newTorchState);
      } catch (err2) {
        console.error('Torch fallback also failed:', err2);
      }
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
          />

          {/* Scan Guide Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-green-400 w-64 h-32 rounded-lg shadow-lg"></div>
          </div>

          {/* Torch Button */}
          {torchSupported && hasPermission && (
            <button
              onClick={toggleTorch}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full hover:bg-opacity-30 transition-all"
            >
              {torchEnabled ? '🔦 Licht AUS' : '💡 Licht AN'}
            </button>
          )}
        </div>

        <div className="bg-black bg-opacity-80 p-4">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold mb-2">Fehler</p>
              <p className="text-sm mb-3">{error}</p>
              <p className="text-xs">
                Tipp: Schließen Sie dieses Fenster und nutzen Sie den Button "Manuell eingeben" als Alternative.
              </p>
            </div>
          ) : hasPermission ? (
            <div className="text-white text-center">
              <p className="text-lg mb-2 font-semibold">Barcode in den grünen Rahmen halten</p>
              <p className="text-sm opacity-75 mb-2">Der Scan erfolgt automatisch</p>
              <div className="text-xs opacity-60 space-y-1">
                <p>💡 Tipp: Halten Sie das Gerät ruhig</p>
                <p>📏 Optimaler Abstand: 10-20 cm</p>
                {torchSupported && <p>🔦 Nutzen Sie das Licht bei schlechter Beleuchtung</p>}
              </div>
            </div>
          ) : (
            <div className="text-white text-center">
              <p className="text-lg mb-2">Kamera wird initialisiert...</p>
              <p className="text-sm opacity-75">Bitte erlauben Sie den Kamera-Zugriff</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
