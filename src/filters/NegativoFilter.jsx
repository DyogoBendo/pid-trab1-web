import { useState } from 'react';

export default function NegativoFilter() {
  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalImage(URL.createObjectURL(selectedFile));
      setProcessedImage(null); // Limpa o resultado anterior se subir nova imagem
    }
  };

  const handleProcessClick = async () => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Faz a requisição para a rota do negativo (sem parâmetros adicionais)
      const response = await fetch('http://localhost:8000/process/negativo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro na API');
      const blob = await response.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      alert('Falha ao processar a imagem. Verifique se o servidor está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
        
        {file && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleProcessClick} 
              disabled={isLoading}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#4da6ff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Processando...' : 'Aplicar Filtro (Negativo)'}
            </button>
          </div>
        )}
      </div>

      {originalImage && (
        <div className="side-by-side-container">
          <div className="image-column">
            <h3>Original</h3>
            <img src={originalImage} alt="Original" className="preview-image" />
          </div>
          <div className="image-column">
            <h3>Processada (Negativo)</h3>
            {processedImage ? (
              <img src={processedImage} alt="Processada" className="preview-image" />
            ) : (
              <div className="placeholder-box">
                {isLoading ? 'Processando...' : 'Clique em "Aplicar Filtro" para gerar'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}