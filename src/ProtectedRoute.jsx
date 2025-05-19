import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const ProtectedRoute = ({ children, role }) => {
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const id = Cookies.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRole = async () => {
            if (id && role) {
                try {
                    const response = await axios.get(`https://helistaging.drukair.com.bt/api/users/${id}`,{
                        withCredentials:true
                    });
                    const fetchedRole = response.data.data.role.name;
                    setUserRole(fetchedRole);
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    navigate('/login');
                } finally {
                    setIsLoading(false);
                }
            }else{
                navigate('/login')
            }
        };

        fetchUserRole();
    }, [id, navigate, role]);

    useEffect(() => {
        if (!isLoading && userRole && role && userRole !== role) {
            navigate('/login');
        }
    }, [isLoading, userRole, role, navigate]);

    if (isLoading) {
        return null; 
    }

    return userRole === role ? children : null;
};

export default ProtectedRoute;
