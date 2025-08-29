import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import Cookies from "js-cookie";

/**
 * Service Axios centralisé pour l'application.
 * Permet de configurer les requêtes HTTP avec gestion des tokens et des erreurs.
 */
class AxiosService {
    private axiosInstance: AxiosInstance;

    /**
     * Initialise l'instance Axios avec la configuration de base.
     */
    constructor(baseURL: string = "/api") {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Intercepteur pour ajouter le token d'authentification si présent (via js-cookie)
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = Cookies.get("accessToken");
                if (token) {
                    config.headers = config.headers ?? {};
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            },
        );

        // Intercepteur pour gérer les erreurs globales
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                // Ici, on pourrait gérer le rafraîchissement du token ou la redirection vers la page de login
                return Promise.reject(error);
            },
        );
    }

    /**
     * Effectue une requête GET.
     * @param url L'URL relative de la ressource
     * @param config Configuration optionnelle de la requête
     * @returns La réponse Axios
     */
    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }

    /**
     * Effectue une requête POST.
     * @param url L'URL relative de la ressource
     * @param data Les données à envoyer
     * @param config Configuration optionnelle de la requête
     * @returns La réponse Axios
     */
    public async post<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    /**
     * Effectue une requête PUT.
     * @param url L'URL relative de la ressource
     * @param data Les données à envoyer
     * @param config Configuration optionnelle de la requête
     * @returns La réponse Axios
     */
    public async put<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config);
    }

    /**
     * Effectue une requête DELETE.
     * @param url L'URL relative de la ressource
     * @param config Configuration optionnelle de la requête
     * @returns La réponse Axios
     */
    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config);
    }
}

const axiosService = new AxiosService();
export default axiosService;
