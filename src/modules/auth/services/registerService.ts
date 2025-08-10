interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER';
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    username: string;
    code: string | null;
    role: string;
  };
}

export async function registerUser(data: RegisterInput): Promise<RegisterResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseBody = await res.json();

  if (!res.ok) {
    throw new Error(responseBody.error || 'Kayıt yapılamadı');
  }

  return responseBody;
}
