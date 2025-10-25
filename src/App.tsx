import React, { useState } from 'react';
import type { ChangeEvent } from 'react';

// --- Funções Utilitárias (movidas para fora do componente) ---

/**
 * Restringe um valor entre um mínimo e um máximo.
 */
const clamp = (x: number, a: number, b: number): number => Math.max(a, Math.min(b, x));

/**
 * Formata um número para exibição.
 */
const fmt = (x: number, n: number = 3): string => (Number.isFinite(x) ? x.toFixed(n) : '--');

/**
 * Retorna uma interpretação textual da pontuação.
 */
const interpret = (s: number): string => {
  if (s > 0.40) return 'Compra forte';
  if (s > 0.15) return 'Considerar';
  if (s >= -0.15) return 'Neutro';
  return 'Evitar';
};

// --- Tipos TypeScript ---

/**
 * Define a estrutura do estado do formulário (usamos strings para inputs).
 */
interface FormState {
  pm: string;
  pa: string;
  fee: string;
  float: string;
  wp: string;
  wf: string;
  alpha: string;
  cap: string;
  r: string;
  liq: string;
  name: string;
}

/**
 * Define a estrutura do objeto de resultado do cálculo.
 */
interface CalculateResult {
  Pm: number;
  PaAdj: number;
  D: number;
  Dc: number;
  Q: number;
  S: number;
  Sfinal: number;
}

/**
 * Define a estrutura de um item no histórico.
 */
interface HistoryItem extends CalculateResult {
  id: string;
  name: string;
  floatValue: string; // Armazena o valor do float usado no cálculo
}

// --- Estado Inicial ---

const initialFormState: FormState = {
  pm: '500',
  pa: '400',
  fee: '0',
  float: '0.12',
  wp: '0.7',
  wf: '0.3',
  alpha: '1',
  cap: '1',
  r: '1',
  liq: '1',
  name: '',
};

// --- Componente de Input Reutilizável ---

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

/**
 * Um componente de input estilizado para evitar repetição no JSX.
 */
const InputField: React.FC<InputFieldProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-xs text-slate-400 mb-1.5">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full p-2.5 rounded-lg border border-white/5 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
    />
  </div>
);

// --- Componente Principal da Aplicação ---

const App: React.FC = () => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [result, setResult] = useState<CalculateResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  /**
   * Manipulador genérico para atualizar o estado de qualquer input.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Executa a lógica principal de cálculo.
   */
  const calculate = (): CalculateResult | null => {
    // Coleta e parseia os valores do estado
    const Pm = parseFloat(formState.pm) || 0;
    const Pa = parseFloat(formState.pa) || 0;
    const fee = parseFloat(formState.fee) || 0;
    const f = parseFloat(formState.float); // Validação especial abaixo
    const wp = parseFloat(formState.wp) || 0;
    const wf = parseFloat(formState.wf) || 0;
    const alpha = parseFloat(formState.alpha) || 1;
    const cap = parseFloat(formState.cap) || 1;
    const r = parseFloat(formState.r) || 1;
    const L = parseFloat(formState.liq); // Validação especial abaixo

    // Validações
    if (!(f >= 0 && f <= 1)) {
      alert('Float deve estar entre 0.00 e 1.00');
      return null;
    }
    if (Pm <= 0) {
      alert('Preço médio deve ser maior que 0');
      return null;
    }
    if (wp + wf <= 0) {
      alert('Soma dos pesos deve ser maior que 0');
      return null;
    }

    // Lógica de Cálculo
    const PaAdj = Pa + fee;
    const D = (Pm - PaAdj) / Pm;
    const Dc = clamp(D, -cap, cap);
    const Q = Math.pow(1 - f, alpha);
    const S = (wp * Dc + wf * Q) / (wp + wf);
    const Liqu = Number.isFinite(L) ? clamp(L, 0, 1) : 1; // Default 1 se não for número
    const Sfinal = S * r * Liqu;

    return { Pm, PaAdj, D, Dc, Q, S, Sfinal };
  };

  /**
   * Manipulador do botão "Calcular".
   */
  const handleCalculate = () => {
    const res = calculate();
    if (res) {
      setResult(res);
    }
  };

  /**
   * Manipulador do botão "Adicionar histórico".
   */
  const handleAddHistory = () => {
    const res = calculate();
    if (res) {
      const newItem: HistoryItem = {
        ...res,
        id: `${new Date().toISOString()}-${Math.random()}`, // ID único simples
        name: formState.name || '—',
        floatValue: formState.float,
      };
      // Adiciona o novo item no início do array (prepend)
      setHistory((prev) => [newItem, ...prev]);
      // Também exibe o resultado do item recém-adicionado
      setResult(res);
    }
  };

  /**
   * Manipulador do botão "Limpar".
   */
  const handleReset = () => {
    setFormState(initialFormState);
    setResult(null);
    setHistory([]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-b from-slate-900 to-[#071022] text-slate-200">
      <div className="w-full max-w-4xl p-5 bg-gradient-to-b from-white/[0.02] to-white/[0.01] rounded-xl shadow-2xl backdrop-blur-sm">
        <h1 className="mb-2 text-xl font-semibold">Calculadora de Vantagem — Skin CS</h1>
        <p className="mb-4 text-sm text-slate-400">
          Insira os valores (preço médio, preço atual, float) e ajuste os pesos se quiser. Clique em <strong>Calcular</strong>.
        </p>

        {/* --- Grid de Inputs --- */}
        <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-3">
          <InputField label="Preço médio (Pm)" id="pm" name="pm" type="number" step="0.01" min="0" value={formState.pm} onChange={handleInputChange} />
          <InputField label="Preço atual (Pa)" id="pa" name="pa" type="number" step="0.01" min="0" value={formState.pa} onChange={handleInputChange} />
          <InputField label="Fee (ex: comissão) (opcional)" id="fee" name="fee" type="number" step="0.01" min="0" value={formState.fee} onChange={handleInputChange} />
          <InputField label="Float (0.00 — 1.00)" id="float" name="float" type="number" step="0.0001" min="0" max="1" value={formState.float} onChange={handleInputChange} />
          <InputField label="Peso do preço (wp)" id="wp" name="wp" type="number" step="0.01" min="0" value={formState.wp} onChange={handleInputChange} />
          <InputField label="Peso do float (wf)" id="wf" name="wf" type="number" step="0.01" min="0" value={formState.wf} onChange={handleInputChange} />
          <InputField label="Sensibilidade do float (α)" id="alpha" name="alpha" type="number" step="0.1" min="0.1" value={formState.alpha} onChange={handleInputChange} />
          <InputField label="Cap do desconto (c)" id="cap" name="cap" type="number" step="0.1" min="0.1" value={formState.cap} onChange={handleInputChange} />
          <InputField label="Multiplicador de raridade (r)" id="r" name="r" type="number" step="0.01" min="0.01" value={formState.r} onChange={handleInputChange} />
          <InputField label="Liquidez (L) 0—1 (opcional)" id="liq" name="liq" type="number" step="0.01" min="0" max="1" value={formState.liq} onChange={handleInputChange} />
          <InputField label="Nome da skin (opcional)" id="name" name="name" type="text" placeholder="ex: AK-47 | Redline" value={formState.name} onChange={handleInputChange} />
          
          {/* --- Botões --- */}
          <div>
            <label className="block text-xs mb-1.5">&nbsp;</label> {/* Para alinhar */}
            <div className="flex gap-2">
              <button
                onClick={handleCalculate}
                className="px-3 py-2.5 text-white bg-violet-600 rounded-lg cursor-pointer hover:bg-violet-700 transition-colors"
              >
                Calcular
              </button>
              <button
                onClick={handleAddHistory}
                className="px-3 py-2.5 bg-transparent border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
              >
                Adicionar histórico
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2.5 bg-transparent border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* --- Seção de Resultado (Condicional) --- */}
        {result && (
          <div className="col-span-1 md:col-span-3">
            <div className="flex items-center justify-between p-3.5 mt-4 rounded-lg bg-gradient-to-b from-violet-600/10 to-violet-600/5">
              <div>
                <div className="text-sm text-slate-400">Pontuação (S<sub>final</sub>)</div>
                <div className="text-2xl font-bold">{fmt(result.Sfinal, 3)}</div>
                <div className="text-sm text-slate-400">{interpret(result.Sfinal)}</div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>Detalhes</div>
                <div>
                  D={fmt(result.D, 3)} | D_c={fmt(result.Dc, 3)} | Q={fmt(result.Q, 3)} | S={fmt(result.S, 3)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tabela de Histórico (Condicional) --- */}
        {history.length > 0 && (
          <div className="col-span-1 md:col-span-3 mt-3.5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-sm text-left border-b border-dashed border-white/5">Skin</th>
                  <th className="p-2 text-sm text-left border-b border-dashed border-white/5">Score</th>
                  <th className="p-2 text-sm text-left border-b border-dashed border-white/5">Status</th>
                  <th className="p-2 text-sm text-left border-b border-dashed border-white/5">Pm</th>
                  <th className="p-2 text-sm text-left border-b border-dashed border-white/5">Pa+Fee</th>
                  <th className="p-2 text-sm text-left border-b border-dashed border-white/5">Float</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 text-sm border-b border-dashed border-white/5">{item.name}</td>
                    <td className="p-2 text-sm border-b border-dashed border-white/5">{fmt(item.Sfinal, 3)}</td>
                    <td className="p-2 text-sm border-b border-dashed border-white/5">{interpret(item.Sfinal)}</td>
                    <td className="p-2 text-sm border-b border-dashed border-white/5">{item.Pm}</td>
                    <td className="p-2 text-sm border-b border-dashed border-white/5">{item.PaAdj}</td>
                    <td className="p-2 text-sm border-b border-dashed border-white/5">{fmt(parseFloat(item.floatValue), 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Dicas: ajuste <strong>w<sub>p</sub></strong> e <strong>w<sub>f</sub></strong> para priorizar preço ou float. Use fee para incluir comissões. Liquidez reduz a pontuação se a skin for difícil de vender.
        </p>
      </div>
    </div>
  );
};

export default App;