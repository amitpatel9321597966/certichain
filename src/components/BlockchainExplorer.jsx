import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Hash, 
  ArrowRight, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  CheckCircle2,
  RefreshCw,
  Box
} from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import { CONTRACT_ADDRESS } from '../contracts/contractABI';
import { truncateHash } from '../utils/crypto';

export default function BlockchainExplorer() {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const fetchBlocks = async () => {
    const chain = await blockchainService.getBlockchainLedger();
    setBlocks(chain);
    if (!selectedBlock && chain.length > 0) {
      setSelectedBlock(chain[0]);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
            Live Distributed Ledger State
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Blockchain Block Explorer
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Inspect immutable cryptographically-linked blocks and verified transaction payloads.
          </p>
        </div>

        <button
          onClick={fetchBlocks}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Sync Chain
        </button>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono-code">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">Total Blocks</span>
          <div className="text-2xl font-black text-slate-900">{blocks.length}</div>
          <span className="text-[10px] text-emerald-700 font-bold">Genesis to Head Block</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">Contract Address</span>
          <div className="text-sm font-bold text-indigo-700 truncate" title={CONTRACT_ADDRESS}>
            {truncateHash(CONTRACT_ADDRESS, 8, 6)}
          </div>
          <span className="text-[10px] text-slate-400">CertificateRegistry.sol</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">Consensus Algorithm</span>
          <div className="text-sm font-bold text-slate-900">Proof of Authority (PoA)</div>
          <span className="text-[10px] text-slate-400">Zero Carbon Footprint</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">Avg Block Time</span>
          <div className="text-2xl font-black text-amber-600">2.1s</div>
          <span className="text-[10px] text-emerald-700 font-bold">Instant Finality</span>
        </div>
      </div>

      {/* Interactive Visual Block Sequence */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" /> Recent Blocks Sequence (Click a block to inspect)
        </h3>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2">
          {blocks.map((b, idx) => {
            const isSelected = selectedBlock?.hash === b.hash;
            const isGenesis = b.index === 0;

            return (
              <React.Fragment key={b.hash}>
                <button
                  onClick={() => setSelectedBlock(b)}
                  className={`flex-shrink-0 text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 shadow-md scale-105'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  }`}
                  style={{ minWidth: '180px' }}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-900 font-mono-code">
                      {isGenesis ? 'Genesis #0' : `Block #${1000 + b.index}`}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-mono-code font-bold">
                      {b.txCount || 1} Tx
                    </span>
                  </div>
                  <div className="text-[10px] font-mono-code text-indigo-700 font-bold truncate">
                    Hash: {truncateHash(b.hash, 6, 4)}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(b.timestamp).toLocaleTimeString()}
                  </div>
                </button>

                {idx < blocks.length - 1 && (
                  <div className="text-slate-300 flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Block Detailed Inspector */}
      {selectedBlock && (
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-mono-code">
                  Block #{selectedBlock.index === 0 ? '0 (Genesis Block)' : 1000 + selectedBlock.index} Details
                </h3>
                <p className="text-xs text-slate-500">Minted on {new Date(selectedBlock.timestamp).toUTCString()}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono-code px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
                ● 100% Finalized
              </span>
            </div>
          </div>

          {/* Cryptographic Hashes Grid */}
          <div className="space-y-3 font-mono-code text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Block Hash:</span>
                <span className="text-indigo-800 font-bold break-all">{selectedBlock.hash}</span>
              </div>
              <button
                onClick={() => copyText(selectedBlock.hash, 'blockHash')}
                className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> {copiedHash === 'blockHash' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Previous Block Hash:</span>
                <span className="text-slate-800 break-all">{selectedBlock.previousHash}</span>
              </div>
              <button
                onClick={() => copyText(selectedBlock.previousHash, 'prevHash')}
                className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> {copiedHash === 'prevHash' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1 font-semibold">Nonce:</span>
                <span className="text-slate-900 font-bold">{selectedBlock.nonce}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1 font-semibold">Miner / Validator:</span>
                <span className="text-slate-900 font-bold truncate block">{truncateHash(selectedBlock.miner, 8, 6)}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1 font-semibold">Unix Timestamp:</span>
                <span className="text-slate-900 font-bold">{selectedBlock.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Block Transaction Payload */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Transactions Sealed in this Block
            </h4>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono-code text-xs text-slate-700 space-y-2 overflow-x-auto">
              {selectedBlock.index === 0 ? (
                <div className="text-emerald-800 font-semibold">
                  {selectedBlock.data?.message || 'Genesis Block Initialization'}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-indigo-800 font-bold border-b border-slate-200 pb-2">
                    <span>Transaction Type: {selectedBlock.data?.type || 'CERT_ISSUANCE'}</span>
                    <span className="text-emerald-700">Status: {selectedBlock.data?.status || 'VALID'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                    <div>Certificate ID: <span className="text-slate-900 font-bold">{selectedBlock.data?.certId}</span></div>
                    <div>Recipient: <span className="text-slate-900 font-bold">{selectedBlock.data?.recipientName}</span></div>
                    <div>Program: <span className="text-slate-800">{selectedBlock.data?.courseName}</span></div>
                    <div>Issuer: <span className="text-slate-800">{selectedBlock.data?.issuerName}</span></div>
                    <div className="sm:col-span-2 text-indigo-700 font-semibold truncate">Certificate Hash: {selectedBlock.data?.certHash}</div>
                    <div className="sm:col-span-2 text-slate-600 truncate">Transaction Hash: {selectedBlock.data?.txHash}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
