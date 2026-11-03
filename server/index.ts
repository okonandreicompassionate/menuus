import { Buffer } from 'node:buffer';
import 'dotenv/config';
import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { env } from 'node:process';
import path from 'node:path';
import { promisify } from 'node:util';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const scrypt = promisify(scryptCallback);
const app = express();
const serverDirectory = dirname(fileURLToPath(import.meta.url));
const staticDirectory = path.resolve(serverDirectory, '../dist');
const port = Number(env.PORT || env.API_PORT || 4000);
const sessionCookie = 'menudrop_session';
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const allowedOrigins = new Set(
  [
    env.APP_ORIGIN,
    env.RENDER_EXTERNAL_URL,
    env.NODE_ENV === 'production' ? '' : 'http://localhost:3000',
  ]
    .filter((origin): origin is string => Boolean(origin))
    .map(origin => new URL(origin).origin),
);

const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env. ' +
    'Get the service-role secret from Supabase Project Settings → API Keys; never use the publishable key for this value.',
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

app.disable('x-powered-by');
app.use(express.json({ limit: '4.25mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

type AppUser = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
};

type RestaurantRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  logo: string;
  cover_image: string;
  whatsapp_number: string;
  address: string;
  opening_hours: string;
  currency: string;
  slug: string;
  is_open: boolean;
  theme: 'warm' | 'dark' | 'clean';
  plan: 'Starter' | 'Pro' | 'Premium';
  status: 'active' | 'suspended';
  created_at: string;
};

type AccountProfile = {
  user: AppUser;
  restaurant: RestaurantRow;
};

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res).catch(next);
  };
}

function readCookie(req: Request, name: string): string | null {
  const prefix = `${name}=`;
  const value = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(prefix));
  return value ? value.slice(prefix.length) : null;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function setSessionCookie(res: Response, token: string) {
  const secure = env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${sessionCookie}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(sessionLifetimeMs / 1000)}${secure}`,
  );
}

function clearSessionCookie(res: Response) {
  const secure = env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null;
}

function makeSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    .replace(/-$/g, '');
}

async function passwordHash(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, saltValue, keyValue, extra] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !saltValue || !keyValue || extra) return false;
  const salt = Buffer.from(saltValue, 'base64url');
  const expectedKey = Buffer.from(keyValue, 'base64url');
  if (salt.length !== 16 || expectedKey.length !== 64) return false;
  const actualKey = await scrypt(password, salt, expectedKey.length) as Buffer;
  return timingSafeEqual(actualKey, expectedKey);
}

async function createSession(userId: string, res: Response) {
  const token = randomBytes(32).toString('hex');
  const { error } = await supabase.from('auth_sessions').insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + sessionLifetimeMs).toISOString(),
  });
  if (error) throw error;
  setSessionCookie(res, token);
}

async function getProfile(userId: string): Promise<AccountProfile | null> {
  const [{ data: user, error: userError }, { data: restaurant, error: restaurantError }] = await Promise.all([
    supabase.from('app_users').select('id,email,name,role').eq('id', userId).maybeSingle(),
    supabase.from('restaurants').select('*').eq('user_id', userId).maybeSingle(),
  ]);
  if (userError) throw userError;
  if (restaurantError) throw restaurantError;
  if (!user || !restaurant) return null;
  return { user, restaurant };
}

async function requireProfile(req: Request): Promise<AccountProfile | null> {
  const token = readCookie(req, sessionCookie);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;

  const { data: session, error } = await supabase
    .from('auth_sessions')
    .select('user_id')
    .eq('token_hash', hashToken(token))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return session ? getProfile(session.user_id) : null;
}

function mapRestaurant(row: RestaurantRow) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    logo: row.logo,
    coverImage: row.cover_image,
    whatsappNumber: row.whatsapp_number,
    address: row.address,
    openingHours: row.opening_hours,
    currency: row.currency,
    slug: row.slug,
    isOpen: row.is_open,
    theme: row.theme,
    plan: row.plan,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapCategory(row: { id: string; restaurant_id: string; name: string; sort_order: number }) {
  return { id: row.id, restaurantId: row.restaurant_id, name: row.name, sortOrder: row.sort_order };
}

function mapMenuItem(row: {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_available: boolean;
}) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image,
    isAvailable: row.is_available,
  };
}

function mapOrder(row: {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string | null;
  delivery_preference: 'delivery' | 'pickup';
  delivery_address: string | null;
  special_instructions: string | null;
  items: Array<{ menuItemId: string; name: string; price: number; quantity: number }>;
  total_amount: number;
  created_at: string;
  status: 'pending' | 'completed' | 'cancelled';
}) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || undefined,
    deliveryPreference: row.delivery_preference,
    deliveryAddress: row.delivery_address || undefined,
    specialInstructions: row.special_instructions || undefined,
    items: row.items,
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at,
    status: row.status,
  };
}

async function authenticatedProfile(req: Request, res: Response): Promise<AccountProfile | null> {
  const profile = await requireProfile(req);
  if (!profile) res.status(401).json({ error: 'Please sign in to continue.' });
  return profile;
}

async function adminProfile(req: Request, res: Response): Promise<AccountProfile | null> {
  const profile = await authenticatedProfile(req, res);
  if (profile && profile.user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access is required.' });
    return null;
  }
  return profile;
}

async function ownedRestaurant(profile: AccountProfile) {
  const { data, error } = await supabase.from('restaurants').select('*').eq('id', profile.restaurant.id).eq('user_id', profile.user.id).maybeSingle();
  if (error) throw error;
  return data as RestaurantRow | null;
}

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function decodeImageData(value: unknown): { bytes: Buffer; mimeType: string; extension: string } | null {
  if (typeof value !== 'string') return null;
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return null;
  const mimeType = match[1];
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length === 0 || bytes.length > 3 * 1024 * 1024) return null;

  const isJpeg = mimeType === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = mimeType === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = mimeType === 'image/webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!isJpeg && !isPng && !isWebp) return null;
  return { bytes, mimeType, extension: mimeType === 'image/jpeg' ? 'jpg' : mimeType.slice('image/'.length) };
}

app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  let requestOrigin: string | null = null;
  try {
    requestOrigin = origin ? new URL(origin).origin : null;
  } catch {
    requestOrigin = null;
  }
  if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
    return res.status(403).json({ error: 'Request origin is not allowed.' });
  }
  next();
});

app.post('/api/auth/signup', asyncRoute(async (req, res) => {
  const name = normalizeText(req.body?.name, 100);
  const restaurantName = normalizeText(req.body?.restaurantName, 100);
  const whatsappNumber = normalizeText(req.body?.whatsappNumber, 32);
  const email = normalizeText(req.body?.email, 254)?.toLowerCase();
  const password = req.body?.password;
  const whatsappDigits = whatsappNumber?.replace(/\D/g, '') || '';

  if (!name || !restaurantName || !whatsappNumber || whatsappDigits.length < 7 || whatsappDigits.length > 15
    || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || typeof password !== 'string' || password.length < 12 || password.length > 128) {
    res.status(400).json({ error: 'Enter your name, restaurant name, valid WhatsApp number, email, and password (12–128 characters).' });
    return;
  }

  const slug = makeSlug(restaurantName);
  if (!slug) {
    res.status(400).json({ error: 'Restaurant name must include letters or numbers.' });
    return;
  }

  const hashedPassword = await passwordHash(password);
  let { data, error } = await supabase.rpc('register_app_user', {
    p_email: email,
    p_name: name,
    p_password_hash: hashedPassword,
    p_restaurant_name: restaurantName,
    p_restaurant_slug: slug,
    p_whatsapp_number: whatsappNumber,
  });
  let usedLegacyRegistrationFunction = false;

  if (error?.code === 'PGRST202' && error.message.includes('register_app_user')) {
    const legacyRegistration = await supabase.rpc('register_app_user', {
      p_email: email,
      p_name: name,
      p_password_hash: hashedPassword,
      p_restaurant_name: restaurantName,
      p_restaurant_slug: slug,
    });
    data = legacyRegistration.data;
    error = legacyRegistration.error;
    usedLegacyRegistrationFunction = !error;
  }

  if (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'An account or restaurant with those details already exists.' });
      return;
    }
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) throw new Error('Account registration did not return the created account.');
  if (usedLegacyRegistrationFunction) {
    const { error: restaurantUpdateError } = await supabase.from('restaurants')
      .update({ whatsapp_number: whatsappNumber })
      .eq('id', row.restaurant_id);
    if (restaurantUpdateError) throw restaurantUpdateError;
  }
  await createSession(row.user_id, res);
  res.status(201).json({
    user: { id: row.user_id, email: row.email, name: row.name, restaurantId: row.restaurant_id, role: 'owner' },
    restaurant: {
      id: row.restaurant_id,
      userId: row.user_id,
      name: row.restaurant_name,
      description: row.description,
      logo: row.logo,
      coverImage: row.cover_image,
      whatsappNumber: row.whatsapp_number,
      address: row.address,
      openingHours: row.opening_hours,
      currency: row.currency,
      slug: row.restaurant_slug,
      isOpen: row.is_open,
      theme: row.theme,
      plan: row.plan,
      status: 'active',
      createdAt: row.created_at,
    },
  });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const email = normalizeText(req.body?.email, 254)?.toLowerCase();
  const password = req.body?.password;
  if (!email || typeof password !== 'string' || password.length > 128) {
    res.status(400).json({ error: 'Enter a valid email and password.' });
    return;
  }

  const { data: account, error } = await supabase
    .from('app_users')
    .select('id,email,name,password_hash')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  if (!account || !(await verifyPassword(password, account.password_hash))) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  const profile = await getProfile(account.id);
  if (!profile) {
    res.status(401).json({ error: 'This account has no restaurant profile. Contact support.' });
    return;
  }
  await createSession(account.id, res);
  res.json({
    user: {
      id: profile.user.id,
      email: profile.user.email,
      name: profile.user.name,
      restaurantId: profile.restaurant.id,
      role: profile.user.role,
    },
    restaurant: {
      id: profile.restaurant.id,
      userId: profile.restaurant.user_id,
      name: profile.restaurant.name,
      description: profile.restaurant.description,
      logo: profile.restaurant.logo,
      coverImage: profile.restaurant.cover_image,
      whatsappNumber: profile.restaurant.whatsapp_number,
      address: profile.restaurant.address,
      openingHours: profile.restaurant.opening_hours,
      currency: profile.restaurant.currency,
      slug: profile.restaurant.slug,
      isOpen: profile.restaurant.is_open,
      theme: profile.restaurant.theme,
      plan: profile.restaurant.plan,
      status: profile.restaurant.status,
      createdAt: profile.restaurant.created_at,
    },
  });
}));

app.get('/api/auth/me', asyncRoute(async (req, res) => {
  const profile = await requireProfile(req);
  if (!profile) {
    res.status(401).json({ error: 'Not signed in.' });
    return;
  }
  res.json({
    user: {
      id: profile.user.id,
      email: profile.user.email,
      name: profile.user.name,
      restaurantId: profile.restaurant.id,
      role: profile.user.role,
    },
    restaurant: {
      id: profile.restaurant.id,
      userId: profile.restaurant.user_id,
      name: profile.restaurant.name,
      description: profile.restaurant.description,
      logo: profile.restaurant.logo,
      coverImage: profile.restaurant.cover_image,
      whatsappNumber: profile.restaurant.whatsapp_number,
      address: profile.restaurant.address,
      openingHours: profile.restaurant.opening_hours,
      currency: profile.restaurant.currency,
      slug: profile.restaurant.slug,
      isOpen: profile.restaurant.is_open,
      theme: profile.restaurant.theme,
      plan: profile.restaurant.plan,
      status: profile.restaurant.status,
      createdAt: profile.restaurant.created_at,
    },
  });
}));

app.post('/api/auth/logout', asyncRoute(async (req, res) => {
  const token = readCookie(req, sessionCookie);
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const { error } = await supabase.from('auth_sessions').delete().eq('token_hash', hashToken(token));
    if (error) throw error;
  }
  clearSessionCookie(res);
  res.status(204).end();
}));

app.get('/api/dashboard', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant profile not found.' });
    return;
  }
  const [categoriesResult, menuResult, ordersResult] = await Promise.all([
    supabase.from('categories').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
    supabase.from('menu_items').select('*').eq('restaurant_id', restaurant.id).order('name'),
    supabase.from('orders').select('*').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false }),
  ]);
  for (const result of [categoriesResult, menuResult, ordersResult]) {
    if (result.error) throw result.error;
  }
  res.json({
    restaurant: mapRestaurant(restaurant),
    categories: (categoriesResult.data || []).map(mapCategory),
    menuItems: (menuResult.data || []).map(mapMenuItem),
    orders: (ordersResult.data || []).map(mapOrder),
  });
}));

app.get('/api/admin/restaurants', asyncRoute(async (req, res) => {
  const profile = await adminProfile(req, res);
  if (!profile) return;
  const [restaurantsResult, usersCountResult, restaurantsCountResult, activeCountResult] = await Promise.all([
    supabase.from('restaurants').select('id,user_id,name,slug,status,plan,created_at').order('created_at', { ascending: false }).limit(500),
    supabase.from('app_users').select('id', { count: 'exact', head: true }),
    supabase.from('restaurants').select('id', { count: 'exact', head: true }),
    supabase.from('restaurants').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);
  if (restaurantsResult.error) throw restaurantsResult.error;
  if (usersCountResult.error) throw usersCountResult.error;
  if (restaurantsCountResult.error) throw restaurantsCountResult.error;
  if (activeCountResult.error) throw activeCountResult.error;

  const ownerIds = [...new Set((restaurantsResult.data || []).map(restaurant => restaurant.user_id))];
  const ownersResult = ownerIds.length
    ? await supabase.from('app_users').select('id,name,email').in('id', ownerIds)
    : { data: [], error: null };
  if (ownersResult.error) throw ownersResult.error;
  const ownersById = new Map((ownersResult.data || []).map(owner => [owner.id, owner]));

  res.json({
    totalUsers: usersCountResult.count || 0,
    totalRestaurants: restaurantsCountResult.count || 0,
    activeRestaurants: activeCountResult.count || 0,
    restaurants: (restaurantsResult.data || []).flatMap(restaurant => {
      const owner = ownersById.get(restaurant.user_id);
      return owner ? [{
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        status: restaurant.status,
        plan: restaurant.plan,
        createdAt: restaurant.created_at,
        owner,
      }] : [];
    }),
  });
}));

app.patch('/api/admin/restaurants/:id/status', asyncRoute(async (req, res) => {
  const profile = await adminProfile(req, res);
  if (!profile) return;
  const status = req.body?.status;
  if (!isUuid(req.params.id) || !['active', 'suspended'].includes(status)) {
    res.status(400).json({ error: 'Choose a valid restaurant status.' });
    return;
  }
  const { data, error } = await supabase.from('restaurants').update({ status })
    .eq('id', req.params.id).select('id,status').maybeSingle();
  if (error) throw error;
  if (!data) {
    res.status(404).json({ error: 'Restaurant not found.' });
    return;
  }
  res.json({ id: data.id, status: data.status });
}));

app.post('/api/images', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  const purpose = req.body?.purpose;
  const image = decodeImageData(req.body?.dataUrl);
  if (!restaurant || !['menu', 'logo', 'cover'].includes(purpose) || !image) {
    res.status(400).json({ error: 'Upload a valid JPG, PNG, or WebP image up to 5 MB.' });
    return;
  }
  const objectPath = `restaurants/${restaurant.id}/${purpose}/${randomUUID()}.${image.extension}`;
  const { data, error } = await supabase.storage.from('menudrop-images').upload(objectPath, image.bytes, {
    contentType: image.mimeType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  const { data: publicUrl } = supabase.storage.from('menudrop-images').getPublicUrl(data.path);
  res.status(201).json({ url: publicUrl.publicUrl });
}));

app.get('/api/storefront/:slug', asyncRoute(async (req, res) => {
  const slug = normalizeText(req.params.slug, 64);
  if (!slug) {
    res.status(400).json({ error: 'Invalid restaurant link.' });
    return;
  }
  const { data: restaurant, error } = await supabase.from('restaurants').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found.' });
    return;
  }
  if (restaurant.status === 'suspended') {
    res.status(404).json({ error: 'This restaurant menu is currently unavailable.' });
    return;
  }
  const [categoriesResult, menuResult] = await Promise.all([
    supabase.from('categories').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
    supabase.from('menu_items').select('*').eq('restaurant_id', restaurant.id).order('name'),
  ]);
  if (categoriesResult.error) throw categoriesResult.error;
  if (menuResult.error) throw menuResult.error;
  res.json({
    restaurant: mapRestaurant(restaurant as RestaurantRow),
    categories: (categoriesResult.data || []).map(mapCategory),
    menuItems: (menuResult.data || []).map(mapMenuItem),
  });
}));

app.put('/api/restaurant', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant profile not found.' });
    return;
  }
  const name = normalizeText(req.body?.name, 100);
  const description = typeof req.body?.description === 'string' ? req.body.description.trim().slice(0, 1000) : null;
  const logo = typeof req.body?.logo === 'string' ? req.body.logo.trim().slice(0, 2000) : null;
  const coverImage = typeof req.body?.coverImage === 'string' ? req.body.coverImage.trim().slice(0, 2000) : null;
  const whatsappNumber = normalizeText(req.body?.whatsappNumber, 32);
  const address = typeof req.body?.address === 'string' ? req.body.address.trim().slice(0, 300) : null;
  const openingHours = typeof req.body?.openingHours === 'string' ? req.body.openingHours.trim().slice(0, 200) : null;
  if (!name || description === null || logo === null || coverImage === null || !whatsappNumber || address === null
    || openingHours === null || typeof req.body?.isOpen !== 'boolean') {
    res.status(400).json({ error: 'Please provide valid store settings.' });
    return;
  }
  const { data, error } = await supabase.from('restaurants').update({
    name, description, logo, cover_image: coverImage, whatsapp_number: whatsappNumber, address,
    opening_hours: openingHours, is_open: req.body.isOpen,
  }).eq('id', restaurant.id).eq('user_id', profile.user.id).select('*').single();
  if (error) throw error;
  res.json(mapRestaurant(data as RestaurantRow));
}));

app.post('/api/categories', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  const name = normalizeText(req.body?.name, 80);
  const sortOrder = Number(req.body?.sortOrder);
  if (!restaurant || !name || !Number.isInteger(sortOrder) || sortOrder < 0) {
    res.status(400).json({ error: 'Provide a valid category name and order.' });
    return;
  }
  const { data, error } = await supabase.from('categories').insert({
    restaurant_id: restaurant.id, name, sort_order: sortOrder,
  }).select('*').single();
  if (error) throw error;
  res.status(201).json(mapCategory(data));
}));

app.put('/api/categories/:id', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  const name = normalizeText(req.body?.name, 80);
  const sortOrder = Number(req.body?.sortOrder);
  if (!restaurant || !isUuid(req.params.id) || !name || !Number.isInteger(sortOrder) || sortOrder < 0) {
    res.status(400).json({ error: 'Provide a valid category.' });
    return;
  }
  const { data, error } = await supabase.from('categories').update({ name, sort_order: sortOrder })
    .eq('id', req.params.id).eq('restaurant_id', restaurant.id).select('*').maybeSingle();
  if (error) throw error;
  if (!data) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  res.json(mapCategory(data));
}));

app.delete('/api/categories/:id', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  if (!restaurant || !isUuid(req.params.id)) {
    res.status(400).json({ error: 'Invalid category.' });
    return;
  }
  const { error, count } = await supabase.from('categories').delete({ count: 'exact' })
    .eq('id', req.params.id).eq('restaurant_id', restaurant.id);
  if (error?.code === '23503') {
    res.status(409).json({ error: 'Move or delete this category’s menu items before deleting it.' });
    return;
  }
  if (error) throw error;
  if (count === 0) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  res.status(204).end();
}));

app.post('/api/menu-items', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  const categoryId = typeof req.body?.categoryId === 'string' ? req.body.categoryId : '';
  const name = normalizeText(req.body?.name, 120);
  const description = typeof req.body?.description === 'string' ? req.body.description.trim().slice(0, 1000) : null;
  const image = typeof req.body?.image === 'string' ? req.body.image.trim().slice(0, 2000) : null;
  const price = Number(req.body?.price);
  if (!restaurant || !isUuid(categoryId) || !name || description === null || image === null
    || !Number.isFinite(price) || price < 0 || typeof req.body?.isAvailable !== 'boolean') {
    res.status(400).json({ error: 'Provide valid menu item details.' });
    return;
  }
  const { data: category, error: categoryError } = await supabase.from('categories').select('id')
    .eq('id', categoryId).eq('restaurant_id', restaurant.id).maybeSingle();
  if (categoryError) throw categoryError;
  if (!category) {
    res.status(400).json({ error: 'Choose a category belonging to your restaurant.' });
    return;
  }
  const { data, error } = await supabase.from('menu_items').insert({
    restaurant_id: restaurant.id, category_id: categoryId, name, description, price,
    image, is_available: req.body.isAvailable,
  }).select('*').single();
  if (error) throw error;
  res.status(201).json(mapMenuItem(data));
}));

app.put('/api/menu-items/:id', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  const categoryId = typeof req.body?.categoryId === 'string' ? req.body.categoryId : '';
  const name = normalizeText(req.body?.name, 120);
  const description = typeof req.body?.description === 'string' ? req.body.description.trim().slice(0, 1000) : null;
  const image = typeof req.body?.image === 'string' ? req.body.image.trim().slice(0, 2000) : null;
  const price = Number(req.body?.price);
  if (!restaurant || !isUuid(req.params.id) || !isUuid(categoryId) || !name || description === null || image === null
    || !Number.isFinite(price) || price < 0 || typeof req.body?.isAvailable !== 'boolean') {
    res.status(400).json({ error: 'Provide valid menu item details.' });
    return;
  }
  const { data: category, error: categoryError } = await supabase.from('categories').select('id')
    .eq('id', categoryId).eq('restaurant_id', restaurant.id).maybeSingle();
  if (categoryError) throw categoryError;
  if (!category) {
    res.status(400).json({ error: 'Choose a category belonging to your restaurant.' });
    return;
  }
  const { data, error } = await supabase.from('menu_items').update({
    category_id: categoryId, name, description, price, image, is_available: req.body.isAvailable,
  }).eq('id', req.params.id).eq('restaurant_id', restaurant.id).select('*').maybeSingle();
  if (error) throw error;
  if (!data) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }
  res.json(mapMenuItem(data));
}));

app.delete('/api/menu-items/:id', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  if (!restaurant || !isUuid(req.params.id)) {
    res.status(400).json({ error: 'Invalid menu item.' });
    return;
  }
  const { error, count } = await supabase.from('menu_items').delete({ count: 'exact' })
    .eq('id', req.params.id).eq('restaurant_id', restaurant.id);
  if (error) throw error;
  if (count === 0) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }
  res.status(204).end();
}));

app.post('/api/orders', asyncRoute(async (req, res) => {
  const restaurantId = typeof req.body?.restaurantId === 'string' ? req.body.restaurantId : '';
  const customerName = normalizeText(req.body?.customerName, 100);
  const customerPhone = typeof req.body?.customerPhone === 'string' ? req.body.customerPhone.trim().slice(0, 32) : '';
  const deliveryPreference = req.body?.deliveryPreference;
  const deliveryAddress = typeof req.body?.deliveryAddress === 'string' ? req.body.deliveryAddress.trim().slice(0, 500) : '';
  const specialInstructions = typeof req.body?.specialInstructions === 'string' ? req.body.specialInstructions.trim().slice(0, 1000) : '';
  const requestedItems = req.body?.items;
  if (!isUuid(restaurantId) || !customerName || !['delivery', 'pickup'].includes(deliveryPreference)
    || !Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 50
    || (deliveryPreference === 'delivery' && !deliveryAddress)) {
    res.status(400).json({ error: 'Provide valid customer and order details.' });
    return;
  }
  const { data: restaurant, error: restaurantError } = await supabase.from('restaurants')
    .select('id,is_open').eq('id', restaurantId).maybeSingle();
  if (restaurantError) throw restaurantError;
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found.' });
    return;
  }
  if (!restaurant.is_open) {
    res.status(409).json({ error: 'This restaurant is currently closed and cannot accept orders.' });
    return;
  }

  const itemQuantities = new Map<string, number>();
  for (const item of requestedItems) {
    const itemId = typeof item?.menuItemId === 'string' ? item.menuItemId : '';
    const quantity = Number(item?.quantity);
    if (!isUuid(itemId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      res.status(400).json({ error: 'The cart contains an invalid menu item or quantity.' });
      return;
    }
    itemQuantities.set(itemId, (itemQuantities.get(itemId) || 0) + quantity);
  }

  const { data: menuRows, error: menuError } = await supabase.from('menu_items').select('id,name,price,is_available')
    .eq('restaurant_id', restaurantId).in('id', [...itemQuantities.keys()]);
  if (menuError) throw menuError;
  if (!menuRows || menuRows.length !== itemQuantities.size || menuRows.some(item => !item.is_available)) {
    res.status(409).json({ error: 'One or more items are unavailable. Refresh the menu and try again.' });
    return;
  }
  const orderItems = menuRows.map(item => ({
    menuItemId: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: itemQuantities.get(item.id)!,
  }));
  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { data, error } = await supabase.from('orders').insert({
    restaurant_id: restaurantId,
    customer_name: customerName,
    customer_phone: customerPhone || null,
    delivery_preference: deliveryPreference,
    delivery_address: deliveryPreference === 'delivery' ? deliveryAddress || null : null,
    special_instructions: specialInstructions || null,
    items: orderItems,
    total_amount: totalAmount,
    status: 'pending',
  }).select('*').single();
  if (error) throw error;
  res.status(201).json(mapOrder(data));
}));

app.patch('/api/orders/:id', asyncRoute(async (req, res) => {
  const profile = await authenticatedProfile(req, res);
  if (!profile) return;
  const restaurant = await ownedRestaurant(profile);
  const status = req.body?.status;
  if (!restaurant || !isUuid(req.params.id) || !['pending', 'completed', 'cancelled'].includes(status)) {
    res.status(400).json({ error: 'Invalid order status.' });
    return;
  }
  const { data, error } = await supabase.from('orders').update({ status })
    .eq('id', req.params.id).eq('restaurant_id', restaurant.id).select('*').maybeSingle();
  if (error) throw error;
  if (!data) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  res.json(mapOrder(data));
}));

if (env.NODE_ENV === 'production') {
  app.use(express.static(staticDirectory));
  app.get('*', (_req, res) => res.sendFile(path.join(staticDirectory, 'index.html')));
}

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API request failed:', error);
  if (res.headersSent) return;
  res.status(500).json({ error: 'The server could not complete the request. Please try again.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`MenuDrop server listening on port ${port}`);
});

export default app;
