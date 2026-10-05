const API_BASE_URL = "API_URL_PLACEHOLDER";

export const fetchProducts = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.category && filters.category !== 'Tous') queryParams.append('category', filters.category);
        if (filters.sort) queryParams.append('sort', filters.sort);
        if (filters.sale) queryParams.append('sale', 'true');

        const response = await fetch(`${API_BASE_URL}/api/produits?${queryParams.toString()}`);
        return await response.json();
    } catch (error) {
        console.error("Erreur API :", error);
        return [];
    }
};

export const fetchProductDetail = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/produits/${id}`);
        return await response.json();
    } catch (error) {
        console.error("Erreur détail produit :", error);
        return null;
    }
};