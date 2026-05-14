import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ImagemComDownload from './ImagemComDownload';

const GraficoHistograma = ({ dados, titulo, valorMaximoY }) => (
  <div className="w-full flex flex-col mt-4">
    <h4 className="font-bold text-center mb-2 text-gray-700">{titulo}</h4>
    <div className="h-48 md:h-64 w-full bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">        
        <BarChart data={dados} barCategoryGap={0}>                    
          <XAxis dataKey="intensidade" tick={{fontSize: 10}} minTickGap={20} />
          
          <YAxis 
            tick={{fontSize: 10}} 
            domain={valorMaximoY ? [0, valorMaximoY] : ['auto', 'auto']} 
          />
          
          <Tooltip 
            cursor={{fill: '#f3f4f6'}} 
            formatter={(value) => [`${value} px`, "Frequência"]} 
            labelFormatter={(l) => `Tom de Cinza: ${l}`} 
          />                    
          <Bar dataKey="quantidade" fill="#3b82f6" isAnimationActive={false} shapeRendering="crispEdges" />
        
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function FiltroGenerico({ 
  titulo, 
  descricao,
  urlFiltro, 
  urlHistograma = "http://localhost:8000/histograma/frequencia", 
  urlCinza = "http://localhost:8000/operacao-pontual/escala-cinza",
  parametrosConfig = [] 
}) {
  
  const [imagemOriginal, setImagemOriginal] = useState(null);
  const [imagemOriginalPreview, setImagemOriginalPreview] = useState(null);
  
  const [valoresParametros, setValoresParametros] = useState(() => {
    const iniciais = {};
    parametrosConfig.forEach(p => { iniciais[p.nome] = p.valorPadrao; });
    return iniciais;
  });

  // Estados para as duas colunas
  const [imagemCinza, setImagemCinza] = useState(null);
  const [dadosHistCinza, setDadosHistCinza] = useState(null);
  
  const [imagemProcessada, setImagemProcessada] = useState(null);
  const [dadosHistProcessada, setDadosHistProcessada] = useState(null);
  
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemOriginal(file);
      setImagemOriginalPreview(URL.createObjectURL(file));
      // Limpa resultados anteriores
      setImagemCinza(null); setDadosHistCinza(null);
      setImagemProcessada(null); setDadosHistProcessada(null);
    }
  };

const processarImagem = async () => {
    if (!imagemOriginal) {
      setErro("Por favor, selecione uma imagem primeiro.");
      return;
    }
    setCarregando(true);
    setErro(null);

    try {      
      const formDataBase = new FormData();
      formDataBase.append("file", imagemOriginal);
      const resCinza = await fetch(urlCinza, { method: "POST", body: formDataBase });
      if (!resCinza.ok) throw new Error("Erro ao obter dados da imagem original.");
      
      const dadosCinza = await resCinza.json();
            
      setImagemCinza(`data:image/png;base64,${dadosCinza.imagem}`);
            
      setDadosHistCinza(dadosCinza.histograma.map((qtd, index) => ({
        intensidade: index,
        quantidade: qtd
      })));
      const queryParams = new URLSearchParams();
      Object.entries(valoresParametros).forEach(([key, value]) => {
        queryParams.append(key, value);
      });

      const queryString = queryParams.toString();
      const urlFinalFiltro = queryString ? `${urlFiltro}?${queryString}` : urlFiltro;
      
      const resFiltro = await fetch(urlFinalFiltro, { method: "POST", body: formDataBase });
      if (!resFiltro.ok) throw new Error("Erro ao processar a imagem no filtro.");
            
      const dadosResposta = await resFiltro.json();
            
      const imagemDataUrl = `data:image/png;base64,${dadosResposta.imagem}`;
      setImagemProcessada(imagemDataUrl);
      
      const dadosHist = dadosResposta.histograma.map((qtd, index) => ({
        intensidade: index,
        quantidade: qtd
      }));
      setDadosHistProcessada(dadosHist);

    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex flex-col font-sans text-gray-800">
            
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-blue-700 mb-1">{titulo}</h2>
        <p className="text-gray-600">{descricao}</p>
      </div>

      <div className="bg-gray-100 p-5 rounded-lg border border-gray-300 mb-8 flex flex-wrap gap-6 items-end shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm text-gray-700">1. Selecione a Imagem:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="bg-white border border-gray-300 p-1.5 rounded cursor-pointer" />
        </div>

        {parametrosConfig.map((p) => (
          <div key={p.nome} className="flex flex-col gap-1">
            <label className="font-bold text-sm text-gray-700">{p.label}:</label>
            <input type={p.tipo} value={valoresParametros[p.nome]} step={p.step || "1"}
              onChange={(e) => setValoresParametros(prev => ({ ...prev, [p.nome]: e.target.value }))}
              className="border border-gray-300 p-2 rounded w-28 text-center outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}

        <button onClick={processarImagem} disabled={carregando}
          className={`ml-auto px-6 py-2.5 rounded font-bold text-white transition-all shadow-md
            ${carregando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}>
          {carregando ? "Processando..." : "Aplicar Filtro ►"}
        </button>
      </div>

      {erro && <div className="bg-red-100 text-red-700 font-bold p-3 rounded mb-6 border border-red-300">{erro}</div>}
      
      {imagemOriginalPreview && (
        <div className="flex flex-col gap-8">                    
          <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
            <h3 className="font-bold text-gray-700 mb-3 text-lg">Imagem Original</h3>
            <ImagemComDownload 
              src={imagemOriginalPreview} 
              alt="Original" 
              nomeArquivo="original.png"
              imgClassName="max-h-64 object-contain rounded shadow-sm" 
            />
          </div>          
          {(imagemCinza || imagemProcessada) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">                            
              <div className="flex flex-col items-center bg-white p-4 rounded-xl border shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-lg border-b w-full text-center pb-2">Entrada (Escala de Cinza)</h3>
                {imagemCinza && <ImagemComDownload src={imagemCinza} alt="Cinza" nomeArquivo="escala_de_cinza.png" imgClassName="max-h-80 object-contain rounded shadow-sm border border-gray-200" />}
                {dadosHistCinza && <GraficoHistograma dados={dadosHistCinza} titulo="Histograma Original" corBarra="#6b7280" />}
              </div>              
              <div className="flex flex-col items-center bg-white p-4 rounded-xl border shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-lg border-b w-full text-center pb-2">Resultado Processado</h3>
                {imagemProcessada && <ImagemComDownload src={imagemProcessada} alt="Processada" nomeArquivo="resultado_filtro.png" imgClassName="max-h-80 object-contain rounded shadow-sm border border-blue-300" />}
                {dadosHistProcessada && <GraficoHistograma dados={dadosHistProcessada} titulo="Histograma Pós-Filtro" corBarra="#6b7280" />}
              </div>              

            </div>
          )}
        </div>
      )}
    </div>
  );
}