import { useState } from 'react';

export default function ThresholdFilter() {
  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [thresholdValue, setThresholdValue] = useState(128);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalImage(URL.createObjectURL(selectedFile));
      setProcessedImage(null); // Clear the previous result when a new image is uploaded
    }
  };

  // This function is now only called when the button is clicked
  const handleProcessClick = async () => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the request with the current slider value
      const response = await fetch(`http://localhost:8000/process/threshold?value=${thresholdValue}`, {
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
        
        {/* Controls only show up if a file has been selected */}
        {file && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div>
              <label>Valor do Limiar (Threshold): <strong>{thresholdValue}</strong></label>
              <br />
              <input 
                type="range" 
                min="0" max="255" 
                value={thresholdValue} 
                onChange={(e) => setThresholdValue(e.target.value)} 
                style={{ width: '200px', marginTop: '0.5rem' }}
              />
            </div>
            
            {/* The new process button */}
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
            <h3>Processada</h3>
            {processedImage ? (
              <img src={processedImage} alt="Processada" className="preview-image" />
            ) : (
              <div className="placeholder-box">
                {isLoading ? 'Processando...' : 'Ajuste o valor e clique em "Aplicar Filtro"'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}