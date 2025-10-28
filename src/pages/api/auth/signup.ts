import type { NextApiRequest, NextApiResponse } from 'next';
import { signUp } from '../../../lib/auth-services';
import { UserRegistration } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const body: UserRegistration = req.body;

      // Basic validation (can be improved)
      if (!body.email || !body.password || !body.full_name || !body.tenant_name || !body.subdomain || !body.address) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { user, tenant, session, error } = await signUp(body);

      if (error) {
        console.error('Signup error in API:', error);
        return res.status(500).json({ error: error.message || 'Signup failed' });
      }

      if (!user || !tenant || !session) {
        return res.status(500).json({ error: 'Signup failed: User, Tenant or Session not created' });
      }

      // Optionally, set a cookie or return the session data
      res.setHeader('Set-Cookie', `session=${session.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`); // Adjust Secure and SameSite as needed

      return res.status(200).json({ user, tenant });

    } catch (error: unknown) {
      console.error('Signup error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }