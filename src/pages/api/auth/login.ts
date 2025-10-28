import type { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from '../../../lib/auth-services';
import { UserLogin } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const body: UserLogin = req.body;

      if (!body.email || !body.password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { access_token, refresh_token, user, error } = await signIn(body);

      if (error) {
        console.error('Login error in API:', error);
        return res.status(401).json({ error: error.message || 'Login failed' });
      }

      if (!access_token || !refresh_token || !user) {
        return res.status(500).json({ error: 'Login failed: Access token, refresh token or user not created' });
      }

      res.setHeader('Set-Cookie', [
        `session=${access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        `refresh_token=${refresh_token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      ]);

      return res.status(200).json({ user });

    } catch (error: unknown) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}