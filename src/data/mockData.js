export const products = [
    {
        id: 'mate-imperial',
        name: 'MATE IMPERIAL PREMIUM',
        price: 45000,
        category: 'Mates',
        description: 'El compañero definitivo para tus aventuras. Fabricado con calabaza seleccionada de paredes gruesas y virola de acero inoxidable de grado quirúrgico. Resistente, elegante y diseñado para durar toda la vida.',
        features: ['Calabaza Brasilera Seleccionada', 'Virola de Acero Inoxidable', 'Costura de Cuero Crudo', 'Base de 4 patas reforzada'],
        image_placeholder: 'Mate Imperial Negro con virola cincelada',
        colors: ['#000000', '#8B4513', '#F5F5DC'], // Black, SaddleBrown, Beige
        capacity: '250ml'
    },
    {
        id: 'mate-camionero',
        name: 'MATE CAMIONERO URUGUAYO',
        price: 38500,
        category: 'Mates',
        description: 'Un clásico todoterreno. Boca ancha para cebar con comodidad y cuerpo robusto para un agarre firme. Ideal para compartir en la montaña o en la ruta.',
        features: ['Boca Ancha Anti-vuelco', 'Cuero Vaqueta Legítimo', 'Interior de Calabaza', 'Virola Lisa'],
        image_placeholder: 'Mate Camionero Marrón Oscuro',
        colors: ['#8B4513', '#000000'],
        capacity: '300ml'
    },
    {
        id: 'termo-media-manija',
        name: 'TERMO 1L MEDIA MANIJA',
        price: 85000,
        category: 'Termos',
        description: 'Tecnología de aislamiento al vacío de doble pared. Mantiene el agua caliente por 24 horas y fría por 36 horas. Pico cebador de precisión para el mate perfecto.',
        features: ['Acero Inoxidable 18/8', 'Libre de BPA', 'Pico Cebador 360°', 'Garantía de por vida'],
        image_placeholder: 'Termo Acero Negro Mate',
        colors: ['#000000', '#FFFFFF', '#2F4F4F'], // Black, White, DarkSlateGray
        capacity: '1L'
    },
    {
        id: 'vaso-termico-flip',
        name: 'VASO TÉRMICO FLIP 500ML',
        price: 32000,
        category: 'Hidratación',
        description: 'Para tu café de la mañana o tu bebida fría en la tarde. Tapa hermética con sistema Flip que evita derrames en movimiento.',
        features: ['Doble Pared Aislante', 'Apto posavasos vehicular', 'Tapa a rosca anti-derrame', 'Mantiene 6h calor / 12h frío'],
        image_placeholder: 'Vaso Térmico Blanco',
        colors: ['#FFFFFF', '#000000', '#C0C0C0'],
        capacity: '500ml'
    },
    {
        id: 'cooler-box',
        name: 'COOLER RUGGED 25QT',
        price: 250000,
        category: 'Coolers',
        description: 'La heladera portátil más resistente del mercado. Paredes inyectadas con poliuretano de alta densidad para mantener el hielo por días.',
        features: ['Retención de hielo 5 días', 'Cierres de goma T-Latch', 'Soportes antideslizantes', 'Construcción rotomoldeada indestructible'],
        image_placeholder: 'Cooler Rígido Gris',
        colors: ['#808080', '#F5F5DC'],
        capacity: '24L'
    },
    {
        id: 'bombilla-pico-loro',
        name: 'BOMBILLA PICO DE LORO',
        price: 12000,
        category: 'Accesorios',
        description: 'Filtrado superior y comodidad al beber. Acero inoxidable de alta calidad que no transmite calor a los labios.',
        features: ['Acero Inoxidable 304', 'Filtro removible para limpieza', 'Curva ergonómica', 'Apta lavavajillas'],
        image_placeholder: 'Bombilla Acero Brillante',
        colors: ['#C0C0C0'],
        capacity: 'N/A'
    }
];

export const brandInfo = {
    origin: 'MENDOZA, ARGENTINA',
    story_title: 'NACIDOS AL PIE DE LOS ANDES',
    story_text: 'En Home & Co, no solo vendemos productos; equipamos aventuras. Nacimos en Mendoza, donde la montaña nos enseñó que el equipamiento debe ser tan resistente como el entorno. Cada mate, cada termo y cada cooler está diseñado para soportar el trato rudo de la vida al aire libre, sin sacrificar el estilo y la elegancia que mereces en tu hogar. Somos robustez. Somos calidad. Somos la pausa perfecta en la cima.',
    values: [
        { title: 'DURABILIDAD EXTREMA', icon: 'ShieldCheck' },
        { title: 'DISEÑO MENDOCINO', icon: 'Mountain' },
        { title: 'GARANTÍA TOTAL', icon: 'Award' }
    ]
};
