
export interface Login {
    email: string;
    password: string;
  }
export interface LoginResponse {
  token: string,
  user: {
    id: number;
    google_id: any;
    name: string;
    email: string;
    password: string;
    pfp: any;
    role: string;
    auth_method: string;
    created_at: string;
  }
}

  export interface GoogleInfos {
    name: string;
    email: string;
    google_id: string;
  }

  export interface CreateAccount {
    name: string;
    email: string;
    password: string;
  }

  export interface UserPosts {
    id: number;
    city: string;
    tag: string;
    title: string;
    text: string;
    name: string;
    link_pfp: string;
    image: string;
  }

  export interface VerifyToken {
    tokenCode: string;
  }

  export interface User {
    id: number;
    google_id: any;
    name: string;
    email: string;
    password: string;
    pfp: any;
    role: string;
    auth_method: string;
    created_at: string;
  }

export interface UserLogged {
  token: string;
  id: number | string;
  name: string;
}

export interface Identify {
    nome: string;
    email: string;
    cargo: string;
    id_usuario: number;
}


export interface ChangePassword {
    senhaVelha: string;
    senhaNova: string
}

