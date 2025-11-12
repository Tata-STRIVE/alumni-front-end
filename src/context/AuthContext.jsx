import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                console.log("AuthContext: Found token in storage. Decoding...");
                const decodedToken = jwtDecode(storedToken);
                
                if (decodedToken.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    const userData = {
                        mobileNumber: decodedToken.sub,
                        fullName: decodedToken.fullName,
                        role: decodedToken.role,
                        tenantId: decodedToken.tenantId
                    };
                    setUser(userData);
                    console.log("AuthContext: Token is valid. User set:", userData);
                } else {
                    console.log("AuthContext: Token is expired. Clearing storage.");
                    localStorage.removeItem('token');
                }
            }
        } catch (error) {
            console.error("AuthContext: Failed to decode token from storage. Clearing storage.", error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userToken) => {
        try {
            console.log("AuthContext: login function called with token:", userToken);
            const decodedToken = jwtDecode(userToken);
            console.log("AuthContext: Decoded token:", decodedToken);

            const userData = {
                mobileNumber: decodedToken.sub,
                fullName: decodedToken.fullName,
                role: decodedToken.role,
                tenantId: decodedToken.tenantId
            };
            
            localStorage.setItem('token', userToken);
            setToken(userToken);
            setUser(userData);
            console.log("AuthContext: User state updated and token stored successfully.");
        } catch (error) {
            console.error("AuthContext: CRITICAL - Failed to decode new JWT during login!", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    // ✅ Derived flags — automatically computed based on role
    const isAdmin = user && ["CENTER_ADMIN", "SUPER_ADMIN", "PLATFORM_ADMIN"].includes(user.role);
    const isAlumnus = user && user.role === "ALUMNUS";

    const authContextValue = {
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,   // ✅ added
        isAlumnus, // ✅ added (optional but useful)
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
