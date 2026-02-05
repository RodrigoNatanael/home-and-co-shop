const TrustBadges = () => {
    return (
        <div className="border-t border-gray-200 mt-6 pt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
                <span>🚚 Envío express desde <strong>Mendoza</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
                <span>💳 Pagos seguros vía <strong>Mercado Pago</strong></span>
            </div>
        </div>
    );
};

export default TrustBadges;
