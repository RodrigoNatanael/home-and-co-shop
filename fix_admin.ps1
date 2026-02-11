$path = "src/pages/AdminPanel.jsx"
$lines = Get-Content $path
# Truncate keeping lines 0 to 1957 (inclusive)
$newLines = $lines | Select-Object -First 1958
$newLines | Set-Content $path -Encoding UTF8

Add-Content $path -Value "                </div>" -Encoding UTF8
Add-Content $path -Value "            </div>" -Encoding UTF8
Add-Content $path -Value "        )}" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "            {/* --- PAYMENT MODAL --- */}" -Encoding UTF8
Add-Content $path -Value "            {paymentModal.open && (" -Encoding UTF8
Add-Content $path -Value "                <div className=`"fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`">" -Encoding UTF8
Add-Content $path -Value "                    <div className=`"bg-white rounded-lg p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200`">" -Encoding UTF8
Add-Content $path -Value "                        <button" -Encoding UTF8
Add-Content $path -Value "                            onClick={() => setPaymentModal({ open: false, sale: null, amount: '' })}" -Encoding UTF8
Add-Content $path -Value "                            className=`"absolute top-2 right-2 text-gray-400 hover:text-black`"" -Encoding UTF8
Add-Content $path -Value "                        >" -Encoding UTF8
Add-Content $path -Value "                            <Plus className=`"transform rotate-45`" size={24} />" -Encoding UTF8
Add-Content $path -Value "                        </button>" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "                        <h3 className=`"font-bold text-xl mb-1`">Registrar Saldo</h3>" -Encoding UTF8
Add-Content $path -Value "                        <p className=`"text-sm text-gray-500 mb-4`">" -Encoding UTF8
Add-Content $path -Value "                            Cliente: <span className=`"font-bold`">{paymentModal.sale?.client}</span>" -Encoding UTF8
Add-Content $path -Value "                        </p>" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "                        <div className=`"bg-red-50 p-3 rounded mb-4 text-center`">" -Encoding UTF8
Add-Content $path -Value "                            <p className=`"text-xs text-red-500 font-bold uppercase`">Deuda Actual</p>" -Encoding UTF8
Add-Content $path -Value "                            <p className=`"text-2xl font-bold text-red-600`">" -Encoding UTF8
Add-Content $path -Value "                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(paymentModal.sale?.total_amount - paymentModal.sale?.paid_amount)}" -Encoding UTF8
Add-Content $path -Value "                            </p>" -Encoding UTF8
Add-Content $path -Value "                        </div>" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "                        <form onSubmit={handleUpdatePayment}>" -Encoding UTF8
Add-Content $path -Value "                            <label className=`"block text-sm font-bold mb-2`">Monto a cobrar ahora:</label>" -Encoding UTF8
Add-Content $path -Value "                            <div className=`"relative mb-4`">" -Encoding UTF8
Add-Content $path -Value "                                <DollarSign size={18} className=`"absolute left-3 top-3 text-gray-400`" />" -Encoding UTF8
Add-Content $path -Value "                                <input" -Encoding UTF8
Add-Content $path -Value "                                    type=`"number`"" -Encoding UTF8
Add-Content $path -Value "                                    autoFocus" -Encoding UTF8
Add-Content $path -Value "                                    required" -Encoding UTF8
Add-Content $path -Value "                                    min=`"1`"" -Encoding UTF8
Add-Content $path -Value "                                    placeholder=`"Ingrese monto...`"" -Encoding UTF8
Add-Content $path -Value "                                    value={paymentModal.amount}" -Encoding UTF8
Add-Content $path -Value "                                    onChange={(e) => setPaymentModal(prev => ({ ...prev, amount: e.target.value }))}" -Encoding UTF8
Add-Content $path -Value "                                    className=`"w-full border p-2 pl-10 rounded text-lg font-bold`"" -Encoding UTF8
Add-Content $path -Value "                                />" -Encoding UTF8
Add-Content $path -Value "                            </div>" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "                            <Button type=`"submit`" className=`"w-full`">" -Encoding UTF8
Add-Content $path -Value "                                Registrar Pago" -Encoding UTF8
Add-Content $path -Value "                            </Button>" -Encoding UTF8
Add-Content $path -Value "                        </form>" -Encoding UTF8
Add-Content $path -Value "                    </div>" -Encoding UTF8
Add-Content $path -Value "                </div>" -Encoding UTF8
Add-Content $path -Value "            )}" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "            {/* --- DELETE CONFIRMATION MODAL --- */}" -Encoding UTF8
Add-Content $path -Value "            {deleteModal.open && (" -Encoding UTF8
Add-Content $path -Value "                <div className=`"fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`">" -Encoding UTF8
Add-Content $path -Value "                    <div className=`"bg-white rounded-lg p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200`">" -Encoding UTF8
Add-Content $path -Value "                        <h3 className=`"font-bold text-xl mb-4 text-red-600 flex items-center gap-2`">" -Encoding UTF8
Add-Content $path -Value "                            <Trash2 /> Eliminar Venta" -Encoding UTF8
Add-Content $path -Value "                        </h3>" -Encoding UTF8
Add-Content $path -Value "                        <p className=`"text-gray-600 mb-6`">" -Encoding UTF8
Add-Content $path -Value "                            ¿Por qué deseas eliminar la venta de <b>{deleteModal.sale?.client}</b>?" -Encoding UTF8
Add-Content $path -Value "                        </p>" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "                        <div className=`"space-y-3`">" -Encoding UTF8
Add-Content $path -Value "                            <button" -Encoding UTF8
Add-Content $path -Value "                                onClick={() => setDeleteModal(prev => ({ ...prev, reason: 'error' }))}" -Encoding UTF8
Add-Content $path -Value "                                className={`w-full p-3 rounded border text-left flex justify-between items-center hover:bg-red-50 transition-colors ${deleteModal.reason === 'error' ? 'border-red-500 bg-red-50 font-bold text-red-700' : 'border-gray-200'}`}" -Encoding UTF8
Add-Content $path -Value "                            >" -Encoding UTF8
Add-Content $path -Value "                                Error de Carga" -Encoding UTF8
Add-Content $path -Value "                                {deleteModal.reason === 'error' && <CheckSquare size={16} />}" -Encoding UTF8
Add-Content $path -Value "                            </button>" -Encoding UTF8
Add-Content $path -Value "                            <button" -Encoding UTF8
Add-Content $path -Value "                                onClick={() => setDeleteModal(prev => ({ ...prev, reason: 'return' }))}" -Encoding UTF8
Add-Content $path -Value "                                className={`w-full p-3 rounded border text-left flex justify-between items-center hover:bg-red-50 transition-colors ${deleteModal.reason === 'return' ? 'border-red-500 bg-red-50 font-bold text-red-700' : 'border-gray-200'}`}" -Encoding UTF8
Add-Content $path -Value "                            >" -Encoding UTF8
Add-Content $path -Value "                                Devolución / Cancelación" -Encoding UTF8
Add-Content $path -Value "                                {deleteModal.reason === 'return' && <CheckSquare size={16} />}" -Encoding UTF8
Add-Content $path -Value "                            </button>" -Encoding UTF8
Add-Content $path -Value "                            <button" -Encoding UTF8
Add-Content $path -Value "                                onClick={() => setDeleteModal(prev => ({ ...prev, reason: 'test' }))}" -Encoding UTF8
Add-Content $path -Value "                                className={`w-full p-3 rounded border text-left flex justify-between items-center hover:bg-red-50 transition-colors ${deleteModal.reason === 'test' ? 'border-red-500 bg-red-50 font-bold text-red-700' : 'border-gray-200'}`}" -Encoding UTF8
Add-Content $path -Value "                            >" -Encoding UTF8
Add-Content $path -Value "                                Prueba de Sistema" -Encoding UTF8
Add-Content $path -Value "                                {deleteModal.reason === 'test' && <CheckSquare size={16} />}" -Encoding UTF8
Add-Content $path -Value "                            </button>" -Encoding UTF8
Add-Content $path -Value "                        </div>" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "                        <div className=`"flex gap-3 mt-6`">" -Encoding UTF8
Add-Content $path -Value "                            <button" -Encoding UTF8
Add-Content $path -Value "                                onClick={() => setDeleteModal({ open: false, sale: null, reason: '' })}" -Encoding UTF8
Add-Content $path -Value "                                className=`"flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded`"" -Encoding UTF8
Add-Content $path -Value "                            >" -Encoding UTF8
Add-Content $path -Value "                                Cancelar" -Encoding UTF8
Add-Content $path -Value "                            </button>" -Encoding UTF8
Add-Content $path -Value "                            <button" -Encoding UTF8
Add-Content $path -Value "                                onClick={handleConfirmDelete}" -Encoding UTF8
Add-Content $path -Value "                                disabled={!deleteModal.reason}" -Encoding UTF8
Add-Content $path -Value "                                className={`flex-1 py-2 font-bold rounded text-white ${deleteModal.reason ? 'bg-red-600 hover:bg-red-700 shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}" -Encoding UTF8
Add-Content $path -Value "                            >" -Encoding UTF8
Add-Content $path -Value "                                Confirmar" -Encoding UTF8
Add-Content $path -Value "                            </button>" -Encoding UTF8
Add-Content $path -Value "                        </div>" -Encoding UTF8
Add-Content $path -Value "" -Encoding UTF8
Add-Content $path -Value "                        {deleteModal.sale?.origin === 'MANUAL' && (" -Encoding UTF8
Add-Content $path -Value "                            <p className=`"text-xs text-center text-gray-400 mt-4`">" -Encoding UTF8
Add-Content $path -Value "                                * Se repondrá el stock automáticamente." -Encoding UTF8
Add-Content $path -Value "                            </p>" -Encoding UTF8
Add-Content $path -Value "                        )}" -Encoding UTF8
Add-Content $path -Value "                    </div>" -Encoding UTF8
Add-Content $path -Value "                </div>" -Encoding UTF8
Add-Content $path -Value "            )}" -Encoding UTF8
Add-Content $path -Value "        </div>" -Encoding UTF8
Add-Content $path -Value "    </div>" -Encoding UTF8
Add-Content $path -Value "    );" -Encoding UTF8
Add-Content $path -Value "}" -Encoding UTF8
