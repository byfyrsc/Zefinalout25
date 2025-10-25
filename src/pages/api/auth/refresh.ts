import type { NextApiRequest, NextApiResponse } from 'next';
import { refreshSession } from '../../../lib/auth-services';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({ error: 'Missing refresh token' });
      }

      const { access_token, refresh_token: newRefreshToken, error } = await refreshSession(refresh_token);

      if (error) {
        console.error('Refresh token error in API:', error);
        return res.status(401).json({ error: error.message || 'Token refresh failed' });
      }

      if (!access_token || !newRefreshToken) {
        return res.status(500).json({ error: 'Token refresh failed: Access token or refresh token not returned' });
      }

      // Set new tokens in cookies
      res.setHeader('Set-Cookie', [
        `session=${access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        `refresh_token=${newRefreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      ]);

      return res.status(200).json({ message: 'Token refreshed successfully' });

    } catch (error: unknown) {
      console.error('Refresh token error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}