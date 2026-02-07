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
import LuckyWheel from './components/marketing/LuckyWheel';
import UrgencyBanner from './components/ui/UrgencyBanner';
import ChatBot from './components/ChatBot';

// 1. Wrapper del Layout (Navbar, Footer, etc.)
function Layout({ children }) {
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/admin-home-co');

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Elementos Públicos */}
      {!isAdminPanel && <Navbar />}
      {!isAdminPanel && <CartDrawer />}
      {!isAdminPanel && <UrgencyBanner />}

      {/* Contenido Principal */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer y Elementos Flotantes (Menos Chatbot) */}
      {!isAdminPanel && (
        <>
          <WhatsAppButton />
          <LuckyWheel />
          <Footer />
        </>
      )}
    </div>
  );
}

// 2. Wrapper Especial para el ChatBot (Fuera del Layout)
function ChatBotWrapper() {
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/admin-home-co');

  // Si estamos en Admin, no renderizamos nada
  if (isAdminPanel) return null;

  // Si estamos en la pública, mostramos el Chatbot
  return <ChatBot />;
}

// 3. Función auxiliar para Scroll
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// 4. Componente Principal APP
function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />

        {/* Layout envuelve las rutas */}
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/envios" element={<Shipping />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/compra-exitosa" element={<Success />} />
            <Route path="/admin-home-co/*" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>

        {/* ChatBot afuera del Layout para evitar conflictos de CSS */}
        <ChatBotWrapper />

      </Router>
    </CartProvider>
  );
}

export default App;