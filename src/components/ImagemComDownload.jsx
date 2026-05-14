import React from 'react';

export default function ImagemComDownload({ 
  src, 
  alt, 
  nomeArquivo = "imagem_processada.png", 
  imgClassName = "max-h-64 object-contain rounded shadow-sm" 
}) {
  
  const handleDownload = () => {
    // Cria um link "fantasma" na memória
    const link = document.createElement('a');
    link.href = src;
    // O atributo 'download' força o navegador a baixar em vez de abrir nova aba
    link.download = nomeArquivo; 
    
    // Adiciona o link ao body temporariamente, clica e depois remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center w-full gap-3 mt-2">
      {/* A imagem em si */}
      <img src={src} alt={alt} className={imgClassName} />
      
      {/* O botão de download por baixo */}
      <button 
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={`Baixar ${alt}`}
      >
        {/* Ícone SVG de Download */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Baixar Imagem
      </button>
    </div>
  );
}