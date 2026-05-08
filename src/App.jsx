import { useState } from 'react';
import Modal from './components/Modal';
import GrayscaleFilter from './filters/GrayscaleFilter';
import ThresholdFilter from './filters/ThresholdFilter';
import PassaBaixaMediaFilter from './filters/PassaBaixaMediaFilter';
import PassaBaixaMedianaFilter from './filters/PassaBaixaMedianaFilter';
import PassaBaixaGaussianoFilter from './filters/PassaBaixaGaussianoFilter';
import NegativoFilter from './filters/NegativoFilter';
import './App.css';

const FILTER_LIST = [
  { id: 'grayscale', name: 'Conversão RGB para Escala de Cinza' },
  { id: 'threshold', name: 'Limiarização (Threshold Dinâmico)' },
  { id: 'negativo', name: 'Negativo da imagem' },
  { id: 'passa_baixa_media', name: 'Passa-Baixa Básico (Média)' },  
  { id: 'passa_baixa_mediana', name: 'Passa-Baixa (Mediana)' },  
  { id: 'passa_baixa_gaussiano', name: 'Passa-Baixa (Gaussiano)' },  
];

function App() {
  const [activeFilterId, setActiveFilterId] = useState(null);

  const closeModal = () => setActiveFilterId(null);

  const renderActiveFilter = () => {
    switch (activeFilterId) {
      case 'grayscale':
        return <GrayscaleFilter />;
      case 'threshold':
        return <ThresholdFilter />;
      case 'passa_baixa_media':
        return <PassaBaixaMediaFilter />;
      case 'passa_baixa_mediana':
        return <PassaBaixaMedianaFilter />;
      case 'passa_baixa_gaussiano':
        return <PassaBaixaGaussianoFilter />;
      case 'negativo':
        return <NegativoFilter />;
      default:
        return <p>Filtro ainda não implementado.</p>;
    }
  };

  return (
    <div className="app-container">
      <h1>Processamento de Imagens</h1>
      <p>Selecione um filtro abaixo para testar:</p>

      <div className="filter-grid">
        {FILTER_LIST.map((filter) => (
          <button 
            key={filter.id} 
            className="filter-button"
            onClick={() => setActiveFilterId(filter.id)}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* O Modal Genérico */}
      <Modal 
        isOpen={activeFilterId !== null} 
        onClose={closeModal}
        title={FILTER_LIST.find(f => f.id === activeFilterId)?.name}
      >
        {renderActiveFilter()}
      </Modal>
    </div>
  );
}

export default App;