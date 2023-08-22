export class UserData {
    error!: boolean;
    token!: string;
    userData!: [
        {
            id: number,
            role_id: number,
            nik: string,
            name: string,
            role_name: string,
            role_detail: string,
            permissions: string
        }
    ]
}