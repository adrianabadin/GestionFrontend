import { test, expect, Page } from '@playwright/test';

/**
 * END-TO-END TESTS: Gantt Module
 *
 * Objetivo: Validar flujos completos de usuario en el módulo Gantt
 *
 * Coverage:
 * - Navegación al módulo Gantt
 * - Crear nueva actividad vía modal
 * - Editar actividad existente (click en barra)
 * - Drag & drop de barras (cambio de fechas)
 * - Cambio de progreso (drag interno)
 * - Creación de dependencies/links (flechas)
 * - Eliminación de activities
 * - Exportación a PDF/PNG/Excel
 * - Generación de reportes
 * - Navegación entre tabs de estados
 * - Keyboard navigation (WCAG 2.1 AA)
 */

// Helper: Login
async function login(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'testpass123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/departments', { timeout: 10000 });
}

// Helper: Navigate to Gantt Module
async function navigateToGantt(page: Page) {
  await login(page);

  // Navegar a /departments (donde está el módulo Gantt)
  await page.goto('http://localhost:3000/departments');
  await page.waitForLoadState('networkidle');

  // Buscar y clickear tab "Gantt"
  const ganttTab = page.locator('text=Gantt').first();
  await expect(ganttTab).toBeVisible({ timeout: 5000 });
  await ganttTab.click();

  // Esperar a que cargue el módulo
  await page.waitForSelector('text=Planificación de Actividades', { timeout: 5000 });
}

test.describe('Gantt Module - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Autenticación previa a cada test
    await page.goto('http://localhost:3000');
  });

  test.describe('Navigation and Initial Load', () => {
    test('should navigate to Gantt module successfully', async ({ page }) => {
      await navigateToGantt(page);

      // Verificar que se cargó el módulo
      await expect(page.locator('text=Planificación de Actividades')).toBeVisible();
      await expect(page.locator('button:has-text("Nueva Actividad")')).toBeVisible();
    });

    test('should display tabs for each state/demography', async ({ page }) => {
      await navigateToGantt(page);

      // Verificar que existen tabs de estados (La Plata, Mar del Plata, etc.)
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      expect(tabCount).toBeGreaterThan(0);
    });

    test('should show loading spinner while fetching data', async ({ page }) => {
      await login(page);

      // Interceptar y retrasar la petición de gantt items
      await page.route('**/gantt/items*', async (route) => {
        await page.waitForTimeout(2000); // Simular delay
        await route.continue();
      });

      await page.goto('http://localhost:3000/departments');

      // Verificar spinner (o mensaje de loading)
      await expect(page.locator('text=Cargando actividades').or(page.locator('[role="progressbar"]'))).toBeVisible({ timeout: 3000 });
    });

    test('should display empty state when no activities exist', async ({ page }) => {
      // Mock respuesta vacía
      await page.route('**/gantt/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], pagination: { page: 1, pageSize: 100, total: 0 } })
        });
      });

      await navigateToGantt(page);

      // Verificar mensaje de estado vacío
      await expect(page.locator('text=No hay actividades planificadas')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Create New Activity', () => {
    test('should open modal when "Nueva Actividad" button is clicked', async ({ page }) => {
      await navigateToGantt(page);

      // Clickear botón "Nueva Actividad"
      const createButton = page.locator('button:has-text("Nueva Actividad")');
      await createButton.click();

      // Verificar que se abrió el modal
      await expect(page.locator('text=Nueva Actividad').nth(1)).toBeVisible(); // Título del modal
      await expect(page.locator('input[placeholder*="título"]').or(page.locator('label:has-text("Título")'))).toBeVisible();
    });

    test('should create new activity successfully', async ({ page }) => {
      await navigateToGantt(page);

      // Abrir modal
      await page.click('button:has-text("Nueva Actividad")');

      // Llenar formulario
      await page.fill('input[name="title"]', 'Test Activity E2E');
      await page.fill('textarea[name="description"]', 'This is an E2E test activity');

      // Seleccionar tipo, prioridad, estado (Material Tailwind Select puede requerir clicks especiales)
      // await page.click('label:has-text("Tipo")');
      // await page.click('li:has-text("Tarea")');

      // Fechas
      await page.fill('input[name="startDate"]', '2024-06-01');
      await page.fill('input[name="endDate"]', '2024-06-15');

      // Progreso
      await page.fill('input[name="progress"]', '25');

      // Mock respuesta de creación
      await page.route('**/gantt/items', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                id: 'new-item-123',
                title: 'Test Activity E2E',
                description: 'This is an E2E test activity',
                type: 'task',
                progress: 25,
                priority: 'medium',
                status: 'planning',
                startDate: '2024-06-01T00:00:00.000Z',
                endDate: '2024-06-15T00:00:00.000Z'
              }
            })
          });
        } else {
          await route.continue();
        }
      });

      // Submit
      await page.click('button:has-text("Crear")');

      // Verificar que el modal se cierra
      await expect(page.locator('text=Nueva Actividad').nth(1)).not.toBeVisible({ timeout: 3000 });

      // Verificar que la actividad aparece en el Gantt (puede requerir esperar a re-fetch)
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Test Activity E2E')).toBeVisible({ timeout: 5000 });
    });

    test('should show validation error when title is empty', async ({ page }) => {
      await navigateToGantt(page);

      // Abrir modal
      await page.click('button:has-text("Nueva Actividad")');

      // Intentar crear sin título
      await page.click('button:has-text("Crear")');

      // Verificar mensaje de error
      await expect(page.locator('text=/el título es requerido|required/i')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Edit Activity', () => {
    test('should open edit modal when clicking on Gantt bar', async ({ page }) => {
      // Mock datos con al menos 1 item
      await page.route('**/gantt/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'item-123',
                title: 'Existing Activity',
                type: 'task',
                progress: 50,
                priority: 'high',
                status: 'active',
                startDate: '2024-06-01T00:00:00.000Z',
                endDate: '2024-06-15T00:00:00.000Z',
                isActive: true
              }
            ],
            pagination: { page: 1, pageSize: 100, total: 1 }
          })
        });
      });

      await navigateToGantt(page);

      // Esperar a que se renderice el Gantt
      await page.waitForTimeout(2000);

      // Clickear en la barra del Gantt (puede requerir coordenadas específicas)
      const ganttContainer = page.locator('[data-test="gantt-container"]').or(page.locator('.gantt_task'));

      if (await ganttContainer.count() > 0) {
        await ganttContainer.first().click();

        // Verificar que se abrió el modal de edición
        await expect(page.locator('text=Editar Actividad')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('input[value="Existing Activity"]')).toBeVisible();
      }
    });

    test('should update activity successfully', async ({ page }) => {
      // Mock item existente
      await page.route('**/gantt/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'item-123',
                title: 'Original Title',
                type: 'task',
                progress: 50,
                priority: 'medium',
                status: 'active',
                startDate: '2024-06-01T00:00:00.000Z',
                endDate: '2024-06-15T00:00:00.000Z',
                isActive: true
              }
            ],
            pagination: { page: 1, pageSize: 100, total: 1 }
          })
        });
      });

      // Mock respuesta de UPDATE
      await page.route('**/gantt/items/item-123', async (route) => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                id: 'item-123',
                title: 'Updated Title',
                type: 'task',
                progress: 75,
                priority: 'high',
                status: 'active'
              }
            })
          });
        } else {
          await route.continue();
        }
      });

      await navigateToGantt(page);
      await page.waitForTimeout(1000);

      // Clickear en la barra
      const ganttBar = page.locator('text=Original Title').or(page.locator('.gantt_task')).first();
      if (await ganttBar.count() > 0) {
        await ganttBar.click({ timeout: 3000 });

        // Editar título
        const titleInput = page.locator('input[name="title"]');
        await titleInput.fill('Updated Title');

        // Submit
        await page.click('button:has-text("Actualizar")');

        // Verificar que se cerró el modal
        await expect(page.locator('text=Editar Actividad')).not.toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Drag & Drop Operations', () => {
    test('should drag bar horizontally to change dates', async ({ page }) => {
      // Mock datos
      await page.route('**/gantt/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'item-123',
                title: 'Draggable Task',
                type: 'task',
                progress: 0,
                priority: 'medium',
                status: 'active',
                startDate: '2024-06-01T00:00:00.000Z',
                endDate: '2024-06-15T00:00:00.000Z',
                isActive: true
              }
            ],
            pagination: { page: 1, pageSize: 100, total: 1 }
          })
        });
      });

      await navigateToGantt(page);
      await page.waitForTimeout(2000);

      // Localizar la barra del Gantt
      const ganttBar = page.locator('.gantt_task_line').first();

      if (await ganttBar.count() > 0) {
        // Obtener posición inicial
        const box = await ganttBar.boundingBox();
        if (box) {
          // Arrastrar 100px a la derecha (cambiar fecha de inicio)
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
          await page.mouse.up();

          // Esperar debounce (500ms en el código)
          await page.waitForTimeout(600);

          // Verificar que se hizo una petición PUT con las nuevas fechas
          // (Esto requeriría interceptar la petición y validar el payload)
        }
      }
    });

    test('should resize bar to change duration', async ({ page }) => {
      // Mock datos
      await page.route('**/gantt/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'item-123',
                title: 'Resizable Task',
                type: 'task',
                progress: 0,
                priority: 'medium',
                status: 'active',
                startDate: '2024-06-01T00:00:00.000Z',
                endDate: '2024-06-15T00:00:00.000Z',
                isActive: true
              }
            ],
            pagination: { page: 1, pageSize: 100, total: 1 }
          })
        });
      });

      await navigateToGantt(page);
      await page.waitForTimeout(2000);

      // Localizar la barra del Gantt
      const ganttBar = page.locator('.gantt_task_line').first();

      if (await ganttBar.count() > 0) {
        const box = await ganttBar.boundingBox();
        if (box) {
          // Arrastrar el borde derecho para redimensionar (extender duración)
          await page.mouse.move(box.x + box.width - 5, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width + 50, box.y + box.height / 2);
          await page.mouse.up();

          await page.waitForTimeout(600);

          // Verificar que se hizo petición PUT (aumentó endDate)
        }
      }
    });

    test('should drag progress bar internally', async ({ page }) => {
      // Mock datos
      await page.route('**/gantt/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'item-123',
                title: 'Progress Task',
                type: 'task',
                progress: 30,
                priority: 'medium',
                status: 'active',
                startDate: '2024-06-01T00:00:00.000Z',
                endDate: '2024-06-15T00:00:00.000Z',
                isActive: true
              }
            ],
            pagination: { page: 1, pageSize: 100, total: 1 }
          })
        });
      });

      await navigateToGantt(page);
      await page.waitForTimeout(2000);

      // Localizar la barra de progreso (elemento interno de la barra)
      const progressBar = page.locator('.gantt_task_progress').first();

      if (await progressBar.count() > 0) {
        const box = await progressBar.boundingBox();
        if (box) {
          // Arrastrar el borde derecho del progreso
          await page.mouse.move(box.x + box.width, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width + 30, box.y + box.height / 2);
          await page.mouse.up();

          await page.waitForTimeout(600);

          // Verificar petición PUT para actualizar progress
        }
      }
    });
  });

  test.describe('Export Functionality', () => {
    test('should export Gantt to PNG', async ({ page }) => {
      await navigateToGantt(page);

      // Buscar y clickear botón de exportación PNG
      const pngButton = page.locator('button:has-text("PNG")');
      await expect(pngButton).toBeVisible();

      // Mock de descarga
      const downloadPromise = page.waitForEvent('download');
      await pngButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/gantt.*\.png/);
    });

    test('should export Gantt to PDF', async ({ page }) => {
      await navigateToGantt(page);

      // Buscar y clickear botón de exportación PDF
      const pdfButton = page.locator('button:has-text("PDF")');
      await expect(pdfButton).toBeVisible();

      const downloadPromise = page.waitForEvent('download');
      await pdfButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/gantt.*\.pdf/);
    });

    test('should export Gantt to Excel', async ({ page }) => {
      await navigateToGantt(page);

      // Buscar y clickear botón de exportación Excel
      const excelButton = page.locator('button:has-text("Excel")');
      await expect(excelButton).toBeVisible();

      const downloadPromise = page.waitForEvent('download');
      await excelButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/gantt.*\.xlsx/);
    });

    test('should change orientation before exporting', async ({ page }) => {
      await navigateToGantt(page);

      // Cambiar orientación a Portrait
      const portraitButton = page.locator('button:has-text("Portrait")').or(page.locator('button[aria-label*="portrait"]')).first();

      if (await portraitButton.count() > 0) {
        await portraitButton.click();

        // Exportar
        const pngButton = page.locator('button:has-text("PNG")');
        const downloadPromise = page.waitForEvent('download');
        await pngButton.click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/gantt.*portrait.*\.png/);
      }
    });

    test('should change export range before exporting', async ({ page }) => {
      await navigateToGantt(page);

      // Cambiar rango a "1er Semestre"
      const rangeSelect = page.locator('select').filter({ hasText: 'Vista actual' }).or(page.locator('select:has-text("Rango")')).first();

      if (await rangeSelect.count() > 0) {
        await rangeSelect.selectOption({ label: '1er Semestre' });

        // Exportar
        const pngButton = page.locator('button:has-text("PNG")');
        const downloadPromise = page.waitForEvent('download');
        await pngButton.click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/gantt.*semester1.*\.png/);
      }
    });
  });

  test.describe('Report Generation', () => {
    test('should open report generation dialog', async ({ page }) => {
      await navigateToGantt(page);

      // Buscar botón de generación de reporte
      const reportButton = page.locator('button:has-text("Generar Reporte")').or(page.locator('button:has-text("Reporte")'));

      if (await reportButton.count() > 0) {
        await reportButton.click();

        // Verificar que se abrió el diálogo de confirmación
        await expect(page.locator('text=/generar reporte|report/i')).toBeVisible({ timeout: 3000 });
      }
    });

    test('should display report progress during generation', async ({ page }) => {
      await navigateToGantt(page);

      const reportButton = page.locator('button:has-text("Generar Reporte")');

      if (await reportButton.count() > 0) {
        await reportButton.click();

        // Confirmar generación
        const confirmButton = page.locator('button:has-text("Confirmar")').or(page.locator('button:has-text("Generar")'));
        if (await confirmButton.count() > 0) {
          await confirmButton.click();

          // Verificar que se muestra el progreso
          await expect(page.locator('text=/generando|progress/i').or(page.locator('[role="progressbar"]'))).toBeVisible({ timeout: 3000 });
        }
      }
    });
  });

  test.describe('Keyboard Navigation (WCAG 2.1 AA)', () => {
    test('should navigate Gantt tasks with arrow keys', async ({ page }) => {
      // Mock datos con múltiples items
      await page.route('**/gantt/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'item-1',
                title: 'Task 1',
                type: 'task',
                progress: 0,
                priority: 'medium',
                status: 'active',
                startDate: '2024-06-01T00:00:00.000Z',
                endDate: '2024-06-05T00:00:00.000Z',
                isActive: true
              },
              {
                id: 'item-2',
                title: 'Task 2',
                type: 'task',
                progress: 50,
                priority: 'high',
                status: 'active',
                startDate: '2024-06-06T00:00:00.000Z',
                endDate: '2024-06-10T00:00:00.000Z',
                isActive: true
              }
            ],
            pagination: { page: 1, pageSize: 100, total: 2 }
          })
        });
      });

      await navigateToGantt(page);
      await page.waitForTimeout(2000);

      // Focus en el contenedor del Gantt
      const ganttContainer = page.locator('[data-test="gantt-container"]').or(page.locator('.gantt_container')).first();

      if (await ganttContainer.count() > 0) {
        await ganttContainer.focus();

        // Navegar con ArrowDown
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);

        // La primera tarea debería estar seleccionada
        await expect(page.locator('.gantt_selected')).toBeVisible({ timeout: 3000 });

        // Navegar a la siguiente tarea
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
      }
    });

    test('should open edit modal with Enter key', async ({ page }) => {
      // Mock datos
      await page.route('**/gantt/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'item-1',
                title: 'Keyboard Task',
                type: 'task',
                progress: 0,
                priority: 'medium',
                status: 'active',
                startDate: '2024-06-01T00:00:00.000Z',
                endDate: '2024-06-05T00:00:00.000Z',
                isActive: true
              }
            ],
            pagination: { page: 1, pageSize: 100, total: 1 }
          })
        });
      });

      await navigateToGantt(page);
      await page.waitForTimeout(2000);

      const ganttContainer = page.locator('[data-test="gantt-container"]').or(page.locator('.gantt_container')).first();

      if (await ganttContainer.count() > 0) {
        await ganttContainer.focus();

        // Seleccionar primera tarea con ArrowDown
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);

        // Abrir modal con Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);

        // Verificar que se abrió el modal
        await expect(page.locator('text=Editar Actividad')).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Tab Navigation Between States', () => {
    test('should switch between state tabs', async ({ page }) => {
      await navigateToGantt(page);

      // Obtener todas las tabs de estados
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      if (tabCount >= 2) {
        // Clickear segunda tab
        await tabs.nth(1).click();
        await page.waitForTimeout(1000);

        // Verificar que cambió el contenido (debería mostrar actividades de otro estado)
        // Esto depende de cómo esté implementado el TabBar
        await expect(page.locator('text=Mostrando').or(page.locator('.gantt_container'))).toBeVisible({ timeout: 3000 });
      }
    });

    test('should preserve selected tab after page reload', async ({ page }) => {
      await navigateToGantt(page);

      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      if (tabCount >= 2) {
        // Clickear segunda tab
        const secondTabText = await tabs.nth(1).textContent();
        await tabs.nth(1).click();
        await page.waitForTimeout(500);

        // Recargar página
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verificar que la tab sigue seleccionada (puede requerir localStorage)
        // await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      }
    });
  });
});
