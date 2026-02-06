import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Shipping from './pages/Shipping';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import Success from './pages/Success';
import AdminPanel from './pages/AdminPanel';

import { CartProvider } from './context/CartContext';
import CartDrawer from './components/cart/CartDrawer';
import WhatsAppButton from './components/ui/WhatsAppButton';

// Wrapper para manejar el Layout de la página
function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartDrawer />
      <WhatsAppButton />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Componente para volver al inicio al cambiar de página
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            {/* Rutas Principales */}
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* Rutas de Información */}
            <Route path="/about" element={<About />} />
            <Route path="/envios" element={<Shipping />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/compra-exitosa" element={<Success />} />

            {/* Panel de Administración (Ubicado antes del NotFound) */}
            <Route path="/admin-home-co" element={<AdminPanel />} />

            {/* El comodín "*" SIEMPRE debe ir al final */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;