import React from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onLogin?: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#717171]">
      <div className="w-full max-w-md p-8">
        <div className="flex justify-center mb-12">
          <img 
            src="https://imgur.com/cZ90AGv.png"
            alt="A-Mover Logo"
            className="h-40 object-contain"
          />
        </div>

        <div className="space-y-6">
          <button 
            onClick={() => login()} 
            className="w-full py-3 bg-[#2EA043] text-white font-medium rounded"
          >
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
