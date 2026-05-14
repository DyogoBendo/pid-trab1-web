import React, { useState } from 'react';
import FiltroGenerico from './components/FiltroGenerico'; // Ajuste o caminho se necessário
import OperacaoAritmetica from './components/OperacaoAritmetica';

// 1. Centralizamos todas as configurações dos filtros aqui
// Isso deixa o código infinitamente mais limpo e fácil de manter!
const LISTA_FILTROS = [
  {
    id: 'passa-baixa-gaussiano',
    titulo: "Filtro Passa-Baixa Gaussiano",    
    urlFiltro: "http://localhost:8000/passa-baixa/gaussiano",
    parametrosConfig: [
      { nome: "tamanho_mascara", label: "Tam. Máscara", tipo: "number", valorPadrao: 3, step: "2"},
      { nome: "sigma", label: "Sigma (Desvio)", tipo: "number", step: "0.1", valorPadrao: 1.0 }
    ]
  },
  {
    id: 'passa-baixa-mediana',
    titulo: "Filtro Passa-Baixa Mediana",    
    urlFiltro: "http://localhost:8000/passa-baixa/mediana",
    parametrosConfig: [
      { nome: "tamanho_mascara", label: "Tam. Máscara", tipo: "number", valorPadrao: 3, step: "2"}
    ]
  },
  {
    id: 'passa-baixa-media',
    titulo: "Filtro Passa-Baixa Média",    
    urlFiltro: "http://localhost:8000/passa-baixa/media",
    parametrosConfig: [
      { nome: "tamanho_mascara", label: "Tam. Máscara", tipo: "number", valorPadrao: 3, step: "2"} 
    ]
  },
  {
    id: 'passa-baixa-minimo',
    titulo: "Filtro Passa-Baixa Mínimo",
    urlFiltro: "http://localhost:8000/passa-baixa/minimo",
    parametrosConfig: [
      { nome: "tamanho_mascara", label: "Tam. Máscara", tipo: "number", valorPadrao: 3, step: "2"} 
    ]
  },
    {
    id: 'passa-baixa-maximo',
    titulo: "Filtro Passa-Baixa Máximo",
    urlFiltro: "http://localhost:8000/passa-baixa/maximo",
    parametrosConfig: [
      { nome: "tamanho_mascara", label: "Tam. Máscara", tipo: "number", valorPadrao: 3, step: "2"} 
    ]
  },
  {
    id: 'passa-alta-reforco',
    titulo: "Filtro Passa-Alta de Alto Reforço",    
    urlFiltro: "http://localhost:8000/passa-alta/alto-reforco",
    parametrosConfig: [
      { nome: "tamanho_mascara", label: "Tam. Máscara", tipo: "number", valorPadrao: 3, step: "2"},
      { nome: "A", label: "Fator de Reforço (A)", tipo: "number", step: "0.1", valorPadrao: 1.2 }
    ]
  },
  {
    id: 'passa-alta-basico',
    titulo: "Filtro Passa-Alta Básico",    
    urlFiltro: "http://localhost:8000/passa-alta/basico",
    parametrosConfig: [
      { nome: "tamanho_mascara", label: "Tam. Máscara", tipo: "number", valorPadrao: 3, step: "2"}
    ]
  },
  {
    id: 'passa-alta-prewitt',
    titulo: "Filtro Passa-Alta Prewitt",    
    urlFiltro: "http://localhost:8000/passa-alta/prewitt",
    parametrosConfig: []
  },
  {
    id: 'passa-alta-roberts',
    titulo: "Filtro Passa-Alta Roberts",    
    urlFiltro: "http://localhost:8000/passa-alta/roberts",
    parametrosConfig: []
  },
  {
    id: 'passa-alta-sobel',
    titulo: "Filtro Passa-Alta Sobel",    
    urlFiltro: "http://localhost:8000/passa-alta/sobel",
    parametrosConfig: []
  },
  {
    id: 'equalizacao-histograma',
    titulo: "Equalização de Histograma",    
    urlFiltro: "http://localhost:8000/histograma/equalizacao",
    parametrosConfig: []
  },
  {
    id: 'negativo',
    titulo: "Negativo",    
    urlFiltro: "http://localhost:8000/operacao-pontual/negativo",
    parametrosConfig: []
  },
  {
    id: 'escala-cinza',
    titulo: "Escala de Cinza",    
    urlFiltro: "http://localhost:8000/operacao-pontual/escala-cinza",
    parametrosConfig: []
  },
  {
    id: 'transformacao-logaritmica',
    titulo: "Transformação Logarítmica",    
    urlFiltro: "http://localhost:8000/operacao-pontual/transformacao-logaritmica",
    parametrosConfig: []
  },
  {
    id: 'segmentacao-otsu',
    titulo: "Otsu",    
    urlFiltro: "http://localhost:8000/segmentacao/otsu",
    parametrosConfig: [] 
  },
  {
    id: 'limiarizacao',
    titulo: "Limizarização",    
    urlFiltro: "http://localhost:8000/segmentacao/limiarizacao",
    parametrosConfig: [
      { nome: "limiar", label: "Limiar", tipo: "number", valorPadrao: 127}
    ] 
  },
  {
    id: 'crescimento-regioes',
    titulo: "Crescimento de Regiões",    
    urlFiltro: "http://localhost:8000/segmentacao/crescimento-regioes",
    parametrosConfig: [
      { nome: "tolerancia", label: "Tolerância", tipo: "number", valorPadrao: 20}
    ] 
  },
  {
    id: 'soma',
    titulo: "Soma",    
    urlFiltro: "http://localhost:8000/operacao-aritmetica/soma",
    tipo: "aritmetica"
  },
  {
    id: 'subtracao',
    titulo: "Subtração",    
    urlFiltro: "http://localhost:8000/operacao-aritmetica/subtracao",
    tipo: "aritmetica"
  },
  {
    id: 'multiplicacao',
    titulo: "Multiplicação",    
    urlFiltro: "http://localhost:8000/operacao-aritmetica/multiplicacao",
    tipo: "aritmetica"
  },
  {
    id: 'divisao',
    titulo: "Divisão",    
    urlFiltro: "http://localhost:8000/operacao-aritmetica/divisao",
    tipo: "aritmetica"
  },
];

function App() {
  const [filtroAtivo, setFiltroAtivo] = useState(null);
  
  const fecharModal = () => {
    setFiltroAtivo(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
            
      <header className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
           Processamento de Imagem Digital
        </h1>        
      </header>
      
      <main className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {LISTA_FILTROS.map((filtro) => (
            <button
              key={filtro.id}
              onClick={() => setFiltroAtivo(filtro)}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:border-blue-500 border border-transparent transition-all text-left flex flex-col items-start focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{filtro.titulo}</h3>              
            </button>
          ))}
        </div>
      </main>
            
      {filtroAtivo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">                    
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setFiltroAtivo(null)}
          ></div>          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">                        
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">PID</h2>
              <button 
                onClick={() => setFiltroAtivo(null)}
                className="text-gray-500 hover:text-red-600 focus:outline-none transition-colors p-2 rounded-full hover:bg-red-50 font-bold"
              >
                ✕ Fechar
              </button>
            </div>            
            <div className="p-6 overflow-y-auto">
              {filtroAtivo.tipo === "aritmetica" ? (
                  <OperacaoAritmetica 
                    titulo={filtroAtivo.titulo}
                    descricao={filtroAtivo.descricao}
                    urlOperacao={filtroAtivo.urlFiltro}
                  />
                   ) : (
                    <FiltroGenerico 
                      titulo={filtroAtivo.titulo}
                      descricao={filtroAtivo.descricao}
                      urlFiltro={filtroAtivo.urlFiltro}
                      parametrosConfig={filtroAtivo.parametrosConfig}
                    />)
              }
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;