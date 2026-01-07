import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eraser } from 'lucide-react';

interface SignatureCanvasProps {
  value?: string; // Base64 da assinatura existente
  onChange: (signatureData: string) => void;
  onClear?: () => void;
  label?: string;
  height?: string; // altura do canvas (ex: "h-32", "h-40")
}

export function SignatureCanvas({
  value,
  onChange,
  onClear,
  label = "Assinatura Digital",
  height = "h-40"
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Configuração inicial do canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Estilo de desenho
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Restaurar assinatura se existe
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    onChange('');
    onClear?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSignature}
          className="text-muted-foreground hover:text-foreground"
        >
          <Eraser className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-2 bg-background">
        <canvas
          ref={canvasRef}
          className={`w-full ${height} cursor-crosshair touch-none`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Assine no campo acima usando o mouse ou o dedo (em dispositivos touch)
      </p>

      {hasSignature && (
        <p className="text-xs text-green-600 dark:text-green-400 text-center">
          ✓ Assinatura capturada
        </p>
      )}
    </div>
  );
}
