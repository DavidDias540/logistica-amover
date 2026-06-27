import React, { createContext, useContext, useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken, apiClient } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  dbUser: any;
  role: string | null;
  companyId: number | null;
  login: () => void;
  logout: () => void;
  token: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const keycloakConfig = {
  url: 'http://localhost:8080/',
  realm: 'amover-realm',
  clientId: 'amover-api', // Assume-se que este cliente está configurado como público no Keycloak
};

const keycloak = new Keycloak(keycloakConfig);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const role = dbUser?.role?.toLowerCase() || null;
  const companyId = dbUser?.companyID ?? null;

  const loadDbUser = async () => {
    try {
      const { data } = await apiClient.get('/api/User/me');
      setDbUser(data);
    } catch (err) {
      console.error('Erro ao carregar utilizador da base de dados', err);
    }
  };

  useEffect(() => {
    keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false }).then((authenticated) => {
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setToken(keycloak.token || null);
        setAuthToken(keycloak.token || null);
        keycloak.loadUserProfile().then(profile => {
          const currentUser = {
            ...profile,
            realmRoles: keycloak.tokenParsed?.realm_access?.roles || []
          };
          setUser(currentUser);
          loadDbUser();
        }).catch(console.error);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Erro ao inicializar Keycloak", err);
      setLoading(false);
    });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
          setToken(keycloak.token || null);
          setAuthToken(keycloak.token || null);
        }
      }).catch(console.error);
    };
  }, []);

  const login = () => keycloak.login();
  const logout = () => keycloak.logout();

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, dbUser, role, companyId, login, logout, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
