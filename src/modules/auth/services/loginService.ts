interface LoginInput {
  identifier: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    username: string;
    role: string;
  };
}

export async function loginUser(data: LoginInput): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseBody = await res.json();

  if (!res.ok) {
    throw new Error(responseBody.message || 'Giriş yapılamadı');
  }

  return responseBody;
}
