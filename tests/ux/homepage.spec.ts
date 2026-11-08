import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Never contact a real TaskPro backend or submit a real booking in these tests.
async function mockNetwork(page: Page) {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'api.example.com' && url.pathname === '/services') {
      return route.fulfill({ json: [{ id: 'test-service', name: 'Plomería', description: 'Servicio de prueba', price: 350, category: 'Plomería', providerId: 'test-provider' }] });
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 503, body: '' });
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return route.abort();
    return route.continue();
  });
}

for (const width of [375, 1440]) {
  test(`client homepage at ${width}px: CTA, search and accessibility`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await mockNetwork(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Qué servicio necesitas hoy/ })).toBeVisible();
    await expect(page.getByText('Datos ilustrativos:', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath(`homepage-${width}.png`), fullPage: true });

    const violations = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(violations.violations).toEqual([]);

    const search = page.getByRole('textbox', { name: /Buscar servicios \(ej/ });
    await search.fill('plomería');
    await expect(page.getByRole('heading', { name: 'Plomería' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Electricidad' })).toHaveCount(0);
    await search.press('Enter');
    await expect(page.locator('#popular-services')).toBeInViewport();
    await page.getByRole('button', { name: 'Solicitar servicio', exact: true }).click();
    await expect(page).toHaveURL(/\/booking$/);
    await expect(page.getByRole('button', { name: 'Reservar Plomería' })).toBeVisible();
    await expect(page.getByText('Proveedor destacado')).toHaveCount(0);
  });
}

test('mobile drawer: focus, Escape, backdrop, navigation and resizing', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await mockNetwork(page);
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Abrir menú' });
  const dialog = page.getByRole('dialog', { name: 'Navegación principal' });
  await expect(menu).toBeVisible();
  await expect(dialog).not.toBeVisible();
  await menu.click();
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(menu).toBeFocused();
  await menu.click();
  await page.mouse.click(365, 400);
  await expect(dialog).not.toBeVisible();
  await menu.click();
  await dialog.getByRole('link', { name: 'Solicitar servicio' }).click();
  await expect(page).toHaveURL(/\/booking$/);
  await expect(dialog).not.toBeVisible();
  await menu.click();
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(dialog).not.toBeVisible();
  await expect(menu).not.toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
});

test('booking dialog exposes labels and supports keyboard closing', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await mockNetwork(page);
  await page.goto('/booking');
  const trigger = page.getByRole('button', { name: 'Reservar Plomería' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Plomería' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Calle', { exact: true })).toBeVisible();
  await expect(dialog.getByLabel('Fecha y Hora')).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});


test('booking catalog errors remain visible without opening a dialog', async ({ page }) => {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'api.example.com' && url.pathname === '/services') return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return route.abort();
    return route.continue();
  });
  await page.goto('/booking');
  await expect(page.getByRole('alert')).toHaveText('Error al cargar el catálogo.');
});

test('desktop topbar search filters the homepage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockNetwork(page);
  await page.goto('/booking');
  await page.getByRole('searchbox', { name: 'Buscar servicios' }).fill('plomería');
  await page.getByRole('searchbox', { name: 'Buscar servicios' }).press('Enter');
  await expect(page).toHaveURL(/\/?q=plomer%C3%ADa#popular-services/);
  await expect(page.getByRole('heading', { name: 'Plomería' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Electricidad' })).toHaveCount(0);
});

for (const width of [375, 1440]) {
  for (const path of ['/login', '/booking', '/onboarding', '/support']) {
    test(`${path} at ${width}px: automated accessibility smoke check`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await mockNetwork(page);
      await page.goto(path);
      if (path === '/booking') await expect(page.getByRole('button', { name: 'Reservar Plomería' })).toBeVisible();
      else if (path === '/login') await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible();
      else if (path === '/onboarding') await expect(page.getByLabel('Nombre completo')).toBeVisible();
      else await expect(page.getByLabel('Nombre completo')).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test('topbar searches keep client favorites and synchronize repeated searches', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockNetwork(page);
  await page.goto('/');
  const favorite = page.getByRole('button', { name: 'Favorito: Plomería' });
  await favorite.click();
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
  const topbarSearch = page.getByRole('searchbox', { name: 'Buscar servicios' });
  await topbarSearch.fill('electricidad');
  await topbarSearch.press('Enter');
  await expect(page.getByRole('heading', { name: 'Electricidad' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Plomería' })).toHaveCount(0);
  await topbarSearch.fill('plomería');
  await topbarSearch.press('Enter');
  await expect(page.getByRole('heading', { name: 'Plomería' })).toBeVisible();
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('textbox', { name: /Buscar servicios \(ej/ })).toHaveValue('plomería');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Electricidad' })).toBeVisible();
  await page.goForward();
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
});

for (const role of ['CLIENT', 'ADMIN', 'PROVIDER'] as const) {
  test(`topbar search is only offered for the client dashboard: ${role}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript((role) => {
      localStorage.setItem('token', `header.${btoa(JSON.stringify({ role, sub: 'test', email: 'test@example.com' }))}.signature`);
    }, role);
    await mockNetwork(page);
    await page.goto('/');
    if (role === 'PROVIDER') await expect(page).toHaveURL(/\/provider$/);
    const search = page.getByRole('searchbox', { name: 'Buscar servicios' });
    if (role === 'CLIENT') await expect(search).toBeVisible();
    else await expect(search).toHaveCount(0);
  });
}
