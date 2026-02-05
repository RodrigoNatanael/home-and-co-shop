import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Parece que te perdiste en el camino.</p>
            <Link to="/">
                <Button size="lg">Volvé al inicio</Button>
            </Link>
        </div>
    );
}
