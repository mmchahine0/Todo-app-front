export interface LoginCredentials{
 email: string;
 password: string;
}
export interface UserResponse{
    statusCode: number;
    message: string;
    data: {
    id: string;
    email: string;
    name:string;
    accessToken: string;
    refreshToken: string;
    };
}