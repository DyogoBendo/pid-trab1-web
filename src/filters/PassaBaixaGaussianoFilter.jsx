import { useState } from 'react';

export default function PassaBaixaGaussianoFilter() {
  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  
  // Parâmetros do filtro
  const [kernelSize, setKernelSize] = useState(3); 
  const [sigma, setSigma] = useState(1.0);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalImage(URL.createObjectURL(selectedFile));
      setProcessedImage(null);
    }
  };

  const handleProcessClick = async () => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:8000/process/passa_baixa_gaussiano?tamanho_mascara=${kernelSize}&sigma=${sigma}`, {
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
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            
            {/* Controle da Máscara */}
            <div>
              <label>Tamanho da Máscara:</label>
              <select 
                value={kernelSize} 
                onChange={(e) => setKernelSize(Number(e.target.value))}
                style={{ marginLeft: '10px', padding: '4px' }}
              >
                <option value={3}>3x3</option>
                <option value={5}>5x5</option>
              </select>
            </div>

            {/* Controle do Sigma */}
            <div>
              <label>Valor de Sigma (Desvio Padrão): <strong>{sigma}</strong></label>
              <br />
              <input 
                type="range" 
                min="0.1" 
                max="5.0" 
                step="0.1"
                value={sigma} 
                onChange={(e) => setSigma(e.target.value)} 
                style={{ width: '200px', marginTop: '0.5rem' }}
              />
            </div>
            
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
                fontWeight: 'bold',
                marginTop: '0.5rem'
              }}
            >
              {isLoading ? 'Processando...' : 'Aplicar Filtro'}
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
            <h3>Processada (Gaussiano)</h3>
            {processedImage ? (
              <img src={processedImage} alt="Processada" className="preview-image" />
            ) : (
              <div className="placeholder-box">
                {isLoading ? 'Processando...' : 'Ajuste os valores e clique em "Aplicar Filtro"'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}