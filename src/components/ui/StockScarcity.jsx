const StockScarcity = ({ stockLimit = 5 }) => {
    return (
        <div className="my-4">
            <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-red-500 uppercase">🔥 ¡Casi agotado!</span>
                <span>Solo quedan {stockLimit} unidades</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full w-[25%] transition-all duration-1000"></div>
            </div>
        </div>
    );
};

export default StockScarcity;
