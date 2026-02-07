import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseclient';
import confetti from 'canvas-confetti';
import { X, Gift } from 'lucide-react';

const LuckyWheel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState('loading'); // loading, form, spin, result
    const [prizes, setPrizes] = useState([]);
    const [selectedPrize, setSelectedPrize] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    // Form State
    const [formData, setFormData] = useState({ name: '', whatsapp: '' });
    const [formLoading, setFormLoading] = useState(false);

    const wheelRef = useRef(null);

    // 1. Initial Check & Auto Open
    useEffect(() => {
        const checkEligibility = async () => {
            const hasPlayed = localStorage.getItem('wheel_played');
            if (hasPlayed) return;

            // Fetch Prizes
            const { data, error } = await supabase
                .from('wheel_config')
                .select('*')
                .gt('stock', 0)
                .order('id');

            if (error || !data || data.length < 2) return; // Need at least 2 prizes to spin

            setPrizes(data);

            // Open after 8 seconds
            setTimeout(() => {
                setIsOpen(true);
                setStep('form');
            }, 8000);
        };

        checkEligibility();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.whatsapp) return;
        setFormLoading(true);
        // We don't save the lead yet, only after spinning to ensure they play
        setStep('spin');
        setFormLoading(false);
    };

    const spinWheel = async () => {
        if (spinning) return;
        setSpinning(true);

        // 1. Determine local winner based on probability
        const totalProb = prizes.reduce((acc, p) => acc + p.probability, 0);
        let random = Math.random() * totalProb;
        let winnerIndex = -1;

        for (let i = 0; i < prizes.length; i++) {
            random -= prizes[i].probability;
            if (random <= 0) {
                winnerIndex = i;
                break;
            }
        }
        if (winnerIndex === -1) winnerIndex = prizes.length - 1; // Fallback

        const winner = prizes[winnerIndex];

        // Calculate rotation
        // 360 / prizes.length = segment size
        // We want to land on the winner index
        const segmentSize = 360 / prizes.length;
        // The wheel spins CLOCKWISE, so to land on index i (at 12 o'clock), 
        // we need to rotate NEGATIVE or Total - (i * size).
        // Let's create a huge spin multiple.
        const baseSpins = 360 * 5; // 5 full spins
        const targetRotation = baseSpins + ((prizes.length - winnerIndex) * segmentSize) - (segmentSize / 2);
        // - segmentSize/2 to center it? It depends on where 0 is. 
        // Usuall 0 deg is 3 o'clock in CSS, or 12 o'clock if we rotate container.
        // Let's keep it simple: Just rotate enough.

        // Random jitter within segment to avoid always landing in exact center
        const jitter = Math.random() * (segmentSize - 10) + 5;

        // Final calculation:
        // winnerIndex 0 needs to be at top.
        // If 0 is at top initially.
        // Rotation = 360 * 5 - (winnerIndex * segmentSize)

        const finalDeg = 1800 + (360 - (winnerIndex * segmentSize));
        setRotation(finalDeg);

        // --- SAVE RESULT IMMEDIATELY (Before Animation Ends) ---
        // As requested: Save lead with prize immediately to avoid data loss
        saveResult(winner).catch(err => console.error("CRITICAL: Failed to save lead during spin:", err));
        // -------------------------------------------------------

        // Wait for animation (5s)
        setTimeout(() => {
            setSpinning(false);
            setSelectedPrize(winner);

            // FIREWORKS!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999
            });

            setStep('result');

        }, 5000);
    };

    const saveResult = async (prize) => {
        try {
            // 1. Decremento Stock (Directo si no hay RPC)
            const { error: stockError } = await supabase
                .from('wheel_config')
                .update({ stock: prize.stock - 1 })
                .eq('id', prize.id);

            if (stockError) console.error("Error actualizando stock:", stockError);

            // 2. Save Lead (FORCED INSERT con nombre de columna correcto)
            console.log("Intentando guardar participante en Supabase:", {
                full_name: formData.name,
                whatsapp: formData.whatsapp,
                prize_won: prize.label
            });

            const { data: leadData, error: leadError } = await supabase
                .from('wheel_leads')
                .insert([{
                    full_name: formData.name, // AQUÍ: Cambiado a full_name
                    whatsapp: formData.whatsapp,
                    prize_won: prize.label
                }])
                .select();

            if (leadError) {
                console.error("❌ ERROR AL GUARDAR LEAD:", leadError);
                alert(`Error en base de datos: ${leadError.message}`);
                return; // Salimos si hay error
            }

            console.log("✅ LEAD GUARDADO CON ÉXITO:", leadData);

            // 3. Local Storage y Eventos
            localStorage.setItem('wheel_played', 'true');
            if (prize.value !== 'NO_PRIZE') {
                localStorage.setItem('wheel_won_expiry', Date.now() + 15 * 60 * 1000); // 15 mins
                localStorage.setItem('wheel_prize_label', prize.label);
                localStorage.setItem('wheel_prize_code', prize.value);
                // Trigger storage event para el banner de urgencia
                window.dispatchEvent(new Event('storage'));
            }
        } catch (err) {
            console.error("ERROR CRÍTICO EN SAVERESULT:", err);
            alert("Hubo un problema técnico al guardar tu premio.");
        }
    };

    const closeWheel = () => {
        setIsOpen(false);
        localStorage.setItem('wheel_played', 'true'); // Ensure they can't play again if they close
    };

    if (!isOpen) return null;

    // --- RENDER HELPERS ---
    // CSS for Wheel Segments
    const wheelStyle = {
        background: `conic-gradient(
            ${prizes.map((p, i) => {
            const start = (i * 100) / prizes.length;
            const end = ((i + 1) * 100) / prizes.length;
            const color = i % 2 === 0 ? '#1a4d2e' : '#f9f5e6'; // Green / Cream
            return `${color} ${start}% ${end}%`;
        }).join(', ')}
        )`,
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-[#d4af37]"> {/* Gold border */}
                <button
                    onClick={closeWheel}
                    className="absolute top-2 right-2 text-gray-400 hover:text-black z-10 p-2"
                >
                    <X size={24} />
                </button>

                {/* HEADER */}
                <div className="bg-[#1a4d2e] p-4 text-center text-white">
                    <h2 className="font-display font-bold text-2xl tracking-wider text-[#d4af37]">RULETA HOME & CO</h2>
                    <p className="text-sm opacity-90">¡Probá tu suerte y ganá!</p>
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col items-center">

                    {step === 'form' && (
                        <div className="w-full space-y-4 animate-in slide-in-from-bottom">
                            <div className="text-center mb-4">
                                <Gift size={48} className="mx-auto text-[#d4af37] mb-2" />
                                <h3 className="font-bold text-lg">¡Completá para Girar!</h3>
                                <p className="text-sm text-gray-500">Ingresá tus datos para participar por premios exclusivos.</p>
                            </div>
                            <form onSubmit={handleFormSubmit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Tu Nombre"
                                    required
                                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#1a4d2e] focus:outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="WhatsApp"
                                    required
                                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#1a4d2e] focus:outline-none"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                />
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full bg-[#1a4d2e] text-white font-bold py-3 rounded hover:bg-[#143d24] transition-colors shadow-lg"
                                >
                                    GIRAR LA RULETA 🎲
                                </button>
                            </form>
                            <p className="text-xs text-center text-gray-400 mt-2">
                                Al participar aceptás recibir novedades por WhatsApp.
                            </p>
                        </div>
                    )}

                    {step === 'spin' && (
                        <div className="relative py-4 scale-90 md:scale-100">
                            {/* MARKER */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-[#d4af37] drop-shadow-lg"></div>

                            {/* WHEEL CONTAINER */}
                            <div
                                className="w-72 h-72 md:w-80 md:h-80 rounded-full border-8 border-gray-800 shadow-2xl relative overflow-hidden"
                                style={wheelStyle}
                            >
                                {/* LABELS */}
                                {prizes.map((p, i) => {
                                    const rotate = (360 / prizes.length) * i + (360 / prizes.length) / 2;
                                    return (
                                        <div
                                            key={p.id}
                                            className="absolute top-1/2 left-1/2 w-full h-[1px] origin-left"
                                            style={{ transform: `rotate(${rotate}deg)` }}
                                        >
                                            <span
                                                className={`absolute left-8 -top-3 text-xs md:text-sm font-bold whitespace-nowrap ${i % 2 === 0 ? 'text-[#f9f5e6]' : 'text-[#1a4d2e]'}`}
                                                style={{ transform: 'translateX(20px)' }}
                                            >
                                                {p.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CENTER BUTTON */}
                            <button
                                onClick={spinWheel}
                                disabled={spinning}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white border-4 border-[#d4af37] rounded-full shadow-xl flex items-center justify-center font-bold text-[#1a4d2e] z-10 hover:scale-105 active:scale-95 transition-transform"
                            >
                                {spinning ? '...' : 'GIRAR'}
                            </button>
                        </div>
                    )}

                    {step === 'result' && selectedPrize && (
                        <div className="text-center animate-in zoom-in spin-in-3">
                            <h3 className="text-2xl font-bold mb-2">¡Felicitaciones! 🎉</h3>
                            <p className="text-gray-600 mb-6">Ganaste: <span className="text-[#1a4d2e] font-bold text-xl block mt-1">{selectedPrize.label}</span></p>

                            {selectedPrize.value !== 'NO_PRIZE' ? (
                                <div className="bg-gray-100 p-4 rounded-lg flex flex-col gap-2 mb-6 border-dashed border-2 border-gray-300">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Tu Código:</p>
                                    <div className="flex items-center gap-2 justify-center">
                                        <code className="text-xl font-mono font-bold bg-white px-4 py-2 rounded border">{selectedPrize.value}</code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(selectedPrize.value)}
                                            className="bg-[#d4af37] text-white p-2 rounded hover:bg-[#b09028]"
                                            title="Copiar Código"
                                        >
                                            📋
                                        </button>
                                    </div>
                                    <p className="text-xs text-red-500 font-bold mt-1">⏳ Vence en 15 minutos</p>
                                </div>
                            ) : (
                                <p className="mb-6 text-sm text-gray-500">¡Gracias por participar! Te enviaremos novedades pronto.</p>
                            )}

                            <button
                                onClick={closeWheel}
                                className="bg-[#1a4d2e] text-white font-bold py-2 px-8 rounded-full hover:bg-[#143d24] transition-all shadow-lg hover:shadow-xl"
                            >
                                {selectedPrize.value !== 'NO_PRIZE' ? 'USAR AHORA' : 'CERRAR'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LuckyWheel;
