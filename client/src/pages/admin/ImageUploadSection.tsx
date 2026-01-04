import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Loader2, 
  Upload, 
  Image as ImageIcon,
  Stamp,
  Users,
  RefreshCw,
  Check,
  X
} from "lucide-react";

interface ImageConfig {
  key: string;
  label: string;
  description: string;
  currentPath: string;
  category: 'stamp' | 'coordinator';
}

const STAMP_IMAGES: ImageConfig[] = [
  {
    key: 'stamp_approved',
    label: 'Carimbo Aprovada',
    description: 'Carimbo verde de proposta aprovada',
    currentPath: '/stamps/aprovada.png',
    category: 'stamp',
  },
  {
    key: 'stamp_review',
    label: 'Carimbo Revisar',
    description: 'Carimbo amarelo de proposta para revisão',
    currentPath: '/stamps/revisar.png',
    category: 'stamp',
  },
  {
    key: 'stamp_rejected',
    label: 'Carimbo Rejeitada',
    description: 'Carimbo vermelho de proposta rejeitada',
    currentPath: '/stamps/rejeitada.png',
    category: 'stamp',
  },
];

const COORDINATOR_IMAGES: ImageConfig[] = [
  {
    key: 'coordinator_novaes',
    label: 'André Novaes',
    description: 'Foto do coordenador André Novaes',
    currentPath: '/coordinators/novaes.jpg',
    category: 'coordinator',
  },
  {
    key: 'coordinator_marlos',
    label: 'Marlos Lima',
    description: 'Foto do coordenador Marlos Lima',
    currentPath: '/coordinators/marlos.png',
    category: 'coordinator',
  },
];

function ImageUploadCard({ config, onUploadSuccess }: { config: ImageConfig; onUploadSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadImage = trpc.admin.uploadSystemImage.useMutation({
    onSuccess: (data) => {
      console.log('[ImageUpload] Upload success:', data);
      toast.success(`Imagem "${config.label}" atualizada com sucesso!`);
      setUploadStatus('Sucesso!');
      onUploadSuccess();
    },
    onError: (error) => {
      console.error('[ImageUpload] Upload error:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
      setPreviewUrl(null);
      setUploadStatus(`Erro: ${error.message}`);
    },
  });
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/xxx;base64, prefix
        const base64 = result.split(',')[1];
        if (!base64) {
          reject(new Error('Falha ao converter imagem para base64'));
          return;
        }
        console.log('[ImageUpload] Base64 conversion successful, length:', base64.length);
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error('[ImageUpload] FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ImageUpload] File select triggered for:', config.key);
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log('[ImageUpload] No file selected');
      return;
    }
    
    console.log('[ImageUpload] File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }
    
    setUploadStatus('Processando...');
    setIsUploading(true);
    
    try {
      // Create preview first
      const previewReader = new FileReader();
      previewReader.onload = (event) => {
        const preview = event.target?.result as string;
        console.log('[ImageUpload] Preview created');
        setPreviewUrl(preview);
      };
      previewReader.readAsDataURL(file);
      
      // Convert to base64 and upload
      console.log('[ImageUpload] Converting to base64...');
      const base64 = await fileToBase64(file);
      
      console.log('[ImageUpload] Uploading to server...', {
        imageKey: config.key,
        fileName: file.name,
        mimeType: file.type,
        base64Length: base64.length,
      });
      
      setUploadStatus('Enviando...');
      
      await uploadImage.mutateAsync({
        imageKey: config.key,
        fileName: file.name,
        mimeType: file.type,
        base64Content: base64,
      });
      
    } catch (error: any) {
      console.error('[ImageUpload] Error during upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
      setPreviewUrl(null);
      setUploadStatus(`Erro: ${error.message || 'Desconhecido'}`);
    } finally {
      setIsUploading(false);
      // Reset file input to allow re-selecting the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleClearPreview = () => {
    setPreviewUrl(null);
    setUploadStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Add cache buster to current image
  const currentImageUrl = `${config.currentPath}?t=${Date.now()}`;
  
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Current/Preview Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-lg border overflow-hidden">
        <img
          src={previewUrl || currentImageUrl}
          alt={config.label}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
        {previewUrl && (
          <div className="absolute top-1 right-1">
            <Button
              size="icon"
              variant="destructive"
              className="w-5 h-5"
              onClick={handleClearPreview}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      
      {/* Info and Upload */}
      <div className="flex-1">
        <Label className="font-medium">{config.label}</Label>
        <p className="text-sm text-gray-500 mb-2">{config.description}</p>
        
        {uploadStatus && (
          <p className={`text-xs mb-2 ${uploadStatus.includes('Erro') ? 'text-red-500' : uploadStatus.includes('Sucesso') ? 'text-green-500' : 'text-blue-500'}`}>
            {uploadStatus}
          </p>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`upload-${config.key}`}
        />
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            console.log('[ImageUpload] Button clicked, triggering file input for:', config.key);
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Escolher Imagem
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ImageUploadSection() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Stamps Section */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stamp className="w-5 h-5" />
            Imagens dos Carimbos
          </CardTitle>
          <CardDescription>
            Faça upload das imagens dos carimbos de avaliação (aprovada, revisar, rejeitada)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {STAMP_IMAGES.map((config) => (
            <ImageUploadCard 
              key={config.key} 
              config={config} 
              onUploadSuccess={handleUploadSuccess}
            />
          ))}
        </CardContent>
      </Card>
      
      {/* Coordinators Section */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Fotos dos Coordenadores
          </CardTitle>
          <CardDescription>
            Faça upload das fotos dos coordenadores do Conselho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {COORDINATOR_IMAGES.map((config) => (
            <ImageUploadCard 
              key={config.key} 
              config={config} 
              onUploadSuccess={handleUploadSuccess}
            />
          ))}
        </CardContent>
      </Card>
      
      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Dicas para as imagens</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Carimbos: use imagens PNG com fundo transparente para melhor resultado</li>
                <li>• Coordenadores: recomendamos imagens quadradas (600x600px) em formato JPG ou PNG</li>
                <li>• Tamanho máximo: 5MB por imagem</li>
                <li>• As alterações são aplicadas imediatamente após o upload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
