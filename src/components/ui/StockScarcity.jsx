const StockScarcity = ({ stock }) => {
    if (!stock || stock <= 0) return null;

    // Percentage for the bar (assuming max scarcity threshold is 5 or 10)
    const percentage = (stock / 10) * 100;

    return (
        <div className="my-4">
            <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-red-500 uppercase flex items-center gap-1">
                    🔥 ¡Casi agotado!
                </span>
                <span className="text-gray-600">Solo quedan {stock} unidades</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
        </div>
    );
};

export default StockScarcity;
