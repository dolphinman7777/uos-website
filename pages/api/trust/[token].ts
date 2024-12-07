import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken, calculateTrustScore } from '../../lib/trustEngine';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.query;

  try {
    const tokenPerformance = await validateToken(token as string);
    const trustScore = await calculateTrustScore(token as string);
    
    res.status(200).json({
      ...tokenPerformance,
      trustScore,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze token' });
  }
} 