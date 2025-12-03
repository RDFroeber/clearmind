import express from 'express';
import { analyzeUpdateIntent } from '../services/openaiService.js';

const router = express.Router();

/**
 * Note: Calendar operations are handled client-side using Google's
 * JavaScript API for better security and direct OAuth flow.
 * 
 * These routes are placeholders for future server-side calendar
 * operations if needed (e.g., webhook notifications, batch operations)
 */

router.get('/health', (req, res) => {
  res.json({ status: 'Calendar service ready' });
});

router.post('/check-update', async (req, res) => {
  try {
    const { text, recentEvents, allEvents } = req.body;

    console.log('=== BACKEND: Check Update Intent ===');
    console.log('Text:', text);
    console.log('Recent events count:', recentEvents?.length || 0);
    console.log('All events count:', allEvents?.length || 0);
    
    if (recentEvents?.length > 0) {
      console.log('Recent events:', recentEvents.map(e => e.summary || e.title));
    }
    if (allEvents?.length > 0) {
      console.log('All events:', allEvents.slice(0, 5).map(e => e.summary || e.title));
    }

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const updateAnalysis = await analyzeUpdateIntent(
      text, 
      recentEvents || [], 
      allEvents || []
    );
    
    console.log('Update analysis result:', updateAnalysis);
    console.log('====================================');
    
    res.json(updateAnalysis);
  } catch (error) {
    console.error('Error checking update intent:', error);
    res.status(500).json({ 
      error: 'Failed to analyze update intent',
      message: error.message 
    });
  }
});

// Future endpoints could include:
// POST /api/calendar/webhook - Handle Google Calendar push notifications
// POST /api/calendar/batch - Batch create/update events
// GET /api/calendar/analyze - Analyze schedule for optimization

export default router;