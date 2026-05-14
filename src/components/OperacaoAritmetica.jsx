import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mini-componente do Gráfico reaproveitado (com escala Y travada)
const GraficoHistograma = ({ dados, titulo, valorMaximoY }) => (
  <div className="w-full flex flex-col mt-2">
    <h4 className="font-bold text-center mb-2 text-gray-700 text-sm">{titulo}</h4>
    <div className="h-40 md:h-56 w-full bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} barCategoryGap={0}>
          <XAxis dataKey="intensidade" tick={{fontSize: 10}} minTickGap={20} />
          <YAxis 
            tick={{fontSize: 10}} 
            domain={valorMaximoY ? [0, valorMaximoY] : ['auto', 'auto']} 
            allowDataOverflow={true} 
          />
          <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => [`${value} px`, "Frequência"]} labelFormatter={(l) => `Tom: ${l}`} />
          <Bar dataKey="quantidade" fill="#3b82f6" isAnimationActive={false} shapeRendering="crispEdges" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function OperacaoAritmetica({ 
  titulo, 
  descricao,
  urlOperacao, 
  urlCinza = "http://localhost:8000/operacao-pontual/escala-cinza",
}) {
  
  // Estados - Imagens Originais
  const [imgOriginal1, setImgOriginal1] = useState(null);
  const [imgOriginal2, setImgOriginal2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);

  // Estados - Resultados (Base64)
  const [cinza1, setCinza1] = useState(null);
  const [cinza2, setCinza2] = useState(null);
  const [processada, setProcessada] = useState(null);

  // Estados - Histogramas
  const [histCinza1, setHistCinza1] = useState(null);
  const [histCinza2, setHistCinza2] = useState(null);
  const [histProcessada, setHistProcessada] = useState(null);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Lidar com uploads
  const handleFileChange = (e, setImg, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      setPreview(URL.createObjectURL(file));
      // Limpa os resultados anteriores se o utilizador trocar a foto
      setCinza1(null); setCinza2(null); setProcessada(null);
      setHistCinza1(null); setHistCinza2(null); setHistProcessada(null);
    }
  };

  const processarOperacao = async () => {
    if (!imgOriginal1 || !imgOriginal2) {
      setErro("Por favor, selecione as DUAS imagens para realizar a operação.");
      return;
    }
    setCarregando(true);
    setErro(null);

    try {
      // 1. Prepara os dados para as 3 requisições
      const fdCinza1 = new FormData(); fdCinza1.append("file", imgOriginal1);
      const fdCinza2 = new FormData(); fdCinza2.append("file", imgOriginal2);
      
      const fdOperacao = new FormData();
      // ATENÇÃO: O seu FastAPI precisa estar à espera de "file1" e "file2"
      fdOperacao.append("file1", imgOriginal1);
      fdOperacao.append("file2", imgOriginal2);

      // 2. Dispara TODAS as requisições em simultâneo (MUITO mais rápido)
      const [resCinza1, resCinza2, resOp] = await Promise.all([
        fetch(urlCinza, { method: "POST", body: fdCinza1 }),
        fetch(urlCinza, { method: "POST", body: fdCinza2 }),
        fetch(urlOperacao, { method: "POST", body: fdOperacao })
      ]);

      if (!resCinza1.ok || !resCinza2.ok || !resOp.ok) {
        throw new Error("Erro de comunicação com o servidor ao processar as imagens.");
      }

      // 3. Extrai os JSONs (Base64 + Array do Histograma)
      const dadosC1 = await resCinza1.json();
      const dadosC2 = await resCinza2.json();
      const dadosOp = await resOp.json();

      // 4. Atualiza a Interface
      const formatarHist = (arr) => arr.map((q, i) => ({ intensidade: i, quantidade: q }));

      setCinza1(`data:image/png;base64,${dadosC1.imagem}`);
      setHistCinza1(formatarHist(dadosC1.histograma));

      setCinza2(`data:image/png;base64,${dadosC2.imagem}`);
      setHistCinza2(formatarHist(dadosC2.histograma));

      setProcessada(`data:image/png;base64,${dadosOp.imagem}`);
      setHistProcessada(formatarHist(dadosOp.histograma));

    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  // 5. Cálculo do eixo Y para igualar a régua dos 3 gráficos
  let maximoY = null;
  if (histCinza1 && histCinza2 && histProcessada) {
    const maxC1 = Math.max(...histCinza1.map(d => d.quantidade));
    const maxC2 = Math.max(...histCinza2.map(d => d.quantidade));
    const maxOp = Math.max(...histProcessada.map(d => d.quantidade));
    const maiorPicoReal = Math.max(maxC1, maxC2, maxOp);
    maximoY = Math.ceil(maiorPicoReal * 1.1); // 10% de folga
  }

  return (
    <div className="flex flex-col font-sans text-gray-800">
      
      {/* CABEÇALHO */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-indigo-700 mb-1">{titulo}</h2>
        <p className="text-gray-600">{descricao}</p>
      </div>

      {/* ÁREA DE CONTROLES */}
      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200 mb-8 flex flex-wrap gap-8 items-center shadow-sm">
        
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm text-indigo-900">Imagem 1 (Base):</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImgOriginal1, setPreview1)} className="bg-white border p-1 rounded" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm text-indigo-900">Imagem 2 (Operador):</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImgOriginal2, setPreview2)} className="bg-white border p-1 rounded" />
        </div>

        <button onClick={processarOperacao} disabled={carregando}
          className={`ml-auto px-6 py-2.5 rounded font-bold text-white transition-all shadow-md
            ${carregando ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {carregando ? "Calculando..." : "Executar Operação"}
        </button>
      </div>

      {erro && <div className="bg-red-100 text-red-700 font-bold p-3 rounded mb-6 border">{erro}</div>}

      {/* ÁREA DE RESULTADOS */}
      {(preview1 || preview2) && (
        <div className="flex flex-col gap-8">
          
          {/* LINHA 1: Imagens Originais (2 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center bg-gray-50 p-3 rounded-xl border border-dashed">
              <h3 className="font-bold text-gray-600 mb-2">Original 1</h3>
              {preview1 ? <img src={preview1} className="max-h-48 object-contain rounded" alt="O1" /> : <div className="h-48 flex items-center text-gray-400">Aguardando...</div>}
            </div>
            <div className="flex flex-col items-center bg-gray-50 p-3 rounded-xl border border-dashed">
              <h3 className="font-bold text-gray-600 mb-2">Original 2</h3>
              {preview2 ? <img src={preview2} className="max-h-48 object-contain rounded" alt="O2" /> : <div className="h-48 flex items-center text-gray-400">Aguardando...</div>}
            </div>
          </div>

          {/* LINHAS 2 e 3: Só aparecem se o resultado estiver pronto */}
          {processada && (
            <div className="flex flex-col gap-4 mt-4 border-t pt-8">
              
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Análise da Operação</h3>

              {/* LINHA 2: Três Imagens (Cinza 1, Cinza 2, Resultado) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="flex flex-col items-center bg-white p-3 border rounded shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2 border-b w-full text-center pb-1">Cinza 1</h4>
                  <img src={cinza1} alt="Cinza 1" className="max-h-64 object-contain rounded border" />
                </div>
                
                <div className="flex flex-col items-center bg-white p-3 border rounded shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2 border-b w-full text-center pb-1">Cinza 2</h4>
                  <img src={cinza2} alt="Cinza 2" className="max-h-64 object-contain rounded border" />
                </div>
                
                <div className="flex flex-col items-center bg-indigo-50 p-3 border border-indigo-200 rounded shadow-sm">
                  <h4 className="font-bold text-indigo-900 mb-2 border-b border-indigo-200 w-full text-center pb-1">Resultado Final</h4>
                  <img src={processada} alt="Resultado" className="max-h-64 object-contain rounded border border-indigo-300" />
                </div>
              </div>

              {/* LINHA 3: Três Histogramas correspondentes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
                <div className="bg-white p-2 border rounded shadow-sm">
                  <GraficoHistograma dados={histCinza1} titulo="Histograma (Cinza 1)" valorMaximoY={maximoY} />
                </div>
                
                <div className="bg-white p-2 border rounded shadow-sm">
                  <GraficoHistograma dados={histCinza2} titulo="Histograma (Cinza 2)" valorMaximoY={maximoY} />
                </div>
                
                <div className="bg-indigo-50 p-2 border border-indigo-200 rounded shadow-sm">
                  <GraficoHistograma dados={histProcessada} titulo="Histograma Resultante" valorMaximoY={maximoY} />
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}