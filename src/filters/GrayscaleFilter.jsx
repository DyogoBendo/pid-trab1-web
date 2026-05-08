import { useState } from 'react';

export default function GrayscaleFilter() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setOriginalImage(URL.createObjectURL(file));
    setProcessedImage(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Ajuste a URL para a rota específica no seu FastAPI
      const response = await fetch('http://localhost:8000/process/grayscale', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro na API');
      const blob = await response.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (error) {
      alert('Falha ao processar a imagem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
        {isLoading && <span className="loading-text">Processando...</span>}
      </div>

      {originalImage && (
        <div className="side-by-side-container">
          <div className="image-column">
            <h3>Original</h3>
            <img src={originalImage} alt="Original" className="preview-image" />
          </div>
          <div className="image-column">
            <h3>Processada</h3>
            {processedImage ? (
              <img src={processedImage} alt="Processada" className="preview-image" />
            ) : (
              <div className="placeholder-box">{isLoading ? 'Aplicando Escala de Cinza...' : ''}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}