import { useState } from 'react';

export default function PassaBaixaMediaFilter() {
  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  // Tamanho padrão da máscara começará em 3 (matriz 3x3)
  const [kernelSize, setKernelSize] = useState(3); 
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
      // Envia a requisição com o tamanho da máscara
      const response = await fetch(`http://localhost:8000/process/passa_baixa_media?kernel_size=${kernelSize}`, {
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
            <div>
              <label>Tamanho da Máscara: <strong>{kernelSize}x{kernelSize}</strong></label>
              <br />
              <input 
                type="range" 
                min="1" 
                max="31" 
                step="2" /* Garante que os valores sejam apenas ímpares */
                value={kernelSize} 
                onChange={(e) => setKernelSize(e.target.value)} 
                style={{ width: '200px', marginTop: '0.5rem' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                Quanto maior, mais "borrada" ficará a imagem.
              </div>
            </div>
            
            <button 
              onClick={handleProcessClick} 
              disabled={isLoading}
              className="filter-button" /* Usando a mesma classe de botão do App.css para manter o padrão */
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#4da6ff',
                color: '#fff',
                border: 'none',
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
            <h3>Processada (Cinza + Média)</h3>
            {processedImage ? (
              <img src={processedImage} alt="Processada" className="preview-image" />
            ) : (
              <div className="placeholder-box">
                {isLoading ? 'Processando...' : 'Ajuste a máscara e clique em "Aplicar Filtro"'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}