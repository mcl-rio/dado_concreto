/**
 * GlobeBackground - Componente decorativo de fundo com o globo
 * Usado para unificar a apresentação visual em todas as páginas
 */

interface GlobeBackgroundProps {
  /** Opacidade do globo (0-100). Padrão: 20 */
  opacity?: number;
  /** Posição vertical: 'top' | 'center' | 'bottom'. Padrão: 'center' */
  position?: 'top' | 'center' | 'bottom';
  /** Tamanho: 'sm' | 'md' | 'lg' | 'xl'. Padrão: 'lg' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Ativar rotação contínua. Padrão: true */
  rotate?: boolean;
}

export function GlobeBackground({ 
  opacity = 30, 
  position = 'center',
  size = 'lg',
  rotate = true
}: GlobeBackgroundProps) {
  const positionClasses = {
    top: 'top-0 -translate-y-1/4',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-0 translate-y-1/4'
  };

  const sizeClasses = {
    sm: 'w-[300px] h-[300px] lg:w-[400px] lg:h-[400px]',
    md: 'w-[400px] h-[400px] lg:w-[600px] lg:h-[600px]',
    lg: 'w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] xl:w-[900px] xl:h-[900px]',
    xl: 'w-[800px] h-[800px] lg:w-[1000px] lg:h-[1000px] xl:w-[1200px] xl:h-[1200px]'
  };

  return (
    <div 
      className={`absolute right-0 ${positionClasses[position]} translate-x-1/4 ${sizeClasses[size]} pointer-events-none`}
      style={{ opacity: opacity / 100 }}
    >
      <img 
        src="/globe-network.png" 
        alt="" 
        className={`w-full h-full object-contain animate-fade-in-up ${rotate ? 'animate-globe-rotate' : ''}`}
        style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
        aria-hidden="true"
      />
    </div>
  );
}

export default GlobeBackground;
