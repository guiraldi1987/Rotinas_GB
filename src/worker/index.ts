import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { 
  authMiddleware,
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME
} from '@getmocha/users-service/backend';
import { setCookie } from 'hono/cookie';
import type { Env } from './types';
import { 
  UserSchema, 
  CreateModuleSchema, 
  UpdateModuleStatusSchema,
  UserRoleSchema 
} from '@/shared/types';

const app = new Hono<{ Bindings: Env }>();

// CORS configuration
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'https://*.mocha.app', 'https://*.sandbox.mocha.app'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// OAuth redirect URL
app.get('/api/oauth/google/redirect_url', async (c) => {
  try {
    const redirectUrl = await getOAuthRedirectUrl('google', {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    return c.json({ redirectUrl }, 200);
  } catch (error) {
    console.error('Error getting OAuth redirect URL:', error);
    return c.json({ error: 'Failed to get redirect URL' }, 500);
  }
});

// Exchange code for session token
app.post('/api/sessions', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.code) {
      return c.json({ error: 'No authorization code provided' }, 400);
    }

    const sessionToken = await exchangeCodeForSessionToken(body.code, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error('Error exchanging code for session token:', error);
    return c.json({ error: 'Authentication failed' }, 400);
  }
});

// Logout
app.get('/api/logout', async (c) => {
  try {
    const sessionToken = c.req.header('cookie')?.split(';')
      .find(row => row.startsWith(`${MOCHA_SESSION_TOKEN_COOKIE_NAME}=`))
      ?.split('=')[1];

    if (sessionToken) {
      await deleteSession(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });
    }

    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
      maxAge: 0,
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error('Error during logout:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

// Get current user
app.get('/api/users/me', authMiddleware, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  try {
    // Check if user exists in our database
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(authUser.id).first();

    if (!existingUser) {
      // Create new user
      await c.env.DB.prepare(`
        INSERT INTO users (id, email, name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        authUser.id,
        authUser.email,
        authUser.google_user_data?.name || null,
        'ROLE_FIREFIGHTER' // Default role
      ).run();

      const newUser = await c.env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(authUser.id).first();

      return c.json(UserSchema.parse(newUser));
    }

    return c.json(UserSchema.parse(existingUser));
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update user role (admin only)
app.put('/api/users/:id/role', authMiddleware, zValidator('json', UserRoleSchema), async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  // Check if current user is officer (can manage roles)
  const currentUser = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(authUser.id).first();

  if (!currentUser || (currentUser.role as string) !== 'ROLE_OFFICER') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  const userId = c.req.param('id');
  const role = c.req.valid('json');

  try {
    await c.env.DB.prepare(`
      UPDATE users 
      SET role = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(role, userId).run();

    const updatedUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first();

    return c.json(UserSchema.parse(updatedUser));
  } catch (error) {
    console.error('Error updating user role:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create module
app.post('/api/modules', authMiddleware, zValidator('json', CreateModuleSchema), async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  // Check if user can create modules
  const currentUser = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(authUser.id).first();

  if (!currentUser || !['ROLE_DRIVER', 'ROLE_FIREFIGHTER'].includes(currentUser.role as string)) {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  const { type, payload } = c.req.valid('json');

  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO modules (type, payload, created_by, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      type,
      JSON.stringify(payload),
      authUser.id
    ).run();

    const newModule = await c.env.DB.prepare(
      'SELECT * FROM modules WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return c.json(newModule);
  } catch (error) {
    console.error('Error creating module:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get modules
app.get('/api/modules', authMiddleware, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  try {
    const modules = await c.env.DB.prepare(`
      SELECT * FROM modules 
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    return c.json(modules.results);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update module status
app.put('/api/modules/:id/status', authMiddleware, zValidator('json', UpdateModuleStatusSchema), async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  // Check if user can validate
  const currentUser = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(authUser.id).first();

  if (!currentUser || !['ROLE_SERGEANT', 'ROLE_B3', 'ROLE_OFFICER'].includes(currentUser.role as string)) {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  const moduleId = c.req.param('id');
  const { status } = c.req.valid('json');

  try {
    // Get current module
    const module = await c.env.DB.prepare(
      'SELECT * FROM modules WHERE id = ?'
    ).bind(moduleId).first();

    if (!module) {
      return c.json({ error: 'Module not found' }, 404);
    }

    // Determine which field to update based on new status
    let updateField = '';
    switch (status) {
      case 'VALIDATED_SERGEANT':
        updateField = 'validated_by';
        break;
      case 'REVIEWED_B3':
        updateField = 'reviewed_by';
        break;
      case 'PUBLISHED_OFFICERS':
        updateField = 'published_by';
        break;
      default:
        return c.json({ error: 'Invalid status' }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE modules 
      SET status = ?, ${updateField} = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, authUser.id, moduleId).run();

    const updatedModule = await c.env.DB.prepare(
      'SELECT * FROM modules WHERE id = ?'
    ).bind(moduleId).first();

    return c.json(updatedModule);
  } catch (error) {
    console.error('Error updating module status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Serve static files for SPA
app.get('*', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta property="og:title" content="Rotinas GB" />
    <meta property="og:description" content="Sistema de Gestão de Rotinas do Corpo de Bombeiros" />
    <meta
      property="og:image"
      content="https://mocha-cdn.com/og.png"
      type="image/png"
    />
    <meta
      property="og:url"
      content="https://getmocha.com"
    />
    <meta property="og:type" content="website" />
    <meta property="og:author" content="Rotinas GB" />
    <meta property="og:site_name" content="Rotinas GB" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:site" content="@rotinasgb" />
    <meta property="twitter:title" content="Rotinas GB" />
    <meta property="twitter:description" content="Sistema de Gestão de Rotinas do Corpo de Bombeiros" />
    <meta
      property="twitter:image"
      content="https://mocha-cdn.com/og.png"
      type="image/png"
    />
    <link
      rel="shortcut icon"
      href="https://mocha-cdn.com/favicon.ico"
      type="image/x-icon"
    />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="https://mocha-cdn.com/apple-touch-icon.png"
      type="image/png"
    />
    <title>Rotinas GB</title>
    <script type="module" crossorigin src="/assets/main.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/style.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
});

export default app;
