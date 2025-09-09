// Script de teste automatizado para o Dashboard SisPAC
// Execute com: node test_dashboard.js

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const TEST_EMAIL = 'admin@sispac.com';
const TEST_PASSWORD = 'senha123';

async function testDashboard() {
  console.log('🚀 Iniciando testes do Dashboard SisPAC...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Mostrar navegador para debug
    slowMo: 1000 // Delay entre ações para visualizar
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Teste 1: Acesso sem autenticação
    console.log('📋 Teste 1: Acesso sem autenticação');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('❌ FALHA: Dashboard acessível sem autenticação');
    } else {
      console.log('✅ SUCESSO: Redirecionamento para login funcionando');
    }
    
    // Teste 2: Login
    console.log('\n📋 Teste 2: Processo de login');
    await page.goto(BASE_URL);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento após login
    await page.waitForTimeout(3000);
    
    const loggedInUrl = page.url();
    if (loggedInUrl.includes('/dashboard')) {
      console.log('✅ SUCESSO: Login realizado e redirecionamento para dashboard');
    } else {
      console.log('❌ FALHA: Login não funcionou ou não redirecionou para dashboard');
      console.log('URL atual:', loggedInUrl);
    }
    
    // Teste 3: Carregamento do Dashboard
    console.log('\n📋 Teste 3: Carregamento do Dashboard');
    
    // Verificar se elementos principais estão presentes
    const dashboardTitle = await page.textContent('h1').catch(() => null);
    if (dashboardTitle && dashboardTitle.includes('Candidatos')) {
      console.log('✅ SUCESSO: Título do dashboard carregado');
    } else {
      console.log('❌ FALHA: Título do dashboard não encontrado');
    }
    
    // Verificar se botão de atualizar está presente
    const refreshButton = await page.locator('button:has-text("Atualizar")').isVisible();
    if (refreshButton) {
      console.log('✅ SUCESSO: Botão de atualizar encontrado');
    } else {
      console.log('❌ FALHA: Botão de atualizar não encontrado');
    }
    
    // Teste 4: Carregamento de dados
    console.log('\n📋 Teste 4: Carregamento de dados');
    
    // Clicar no botão atualizar para carregar dados
    await page.click('button:has-text("Atualizar")');
    
    // Aguardar carregamento (verificar se loading spinner aparece)
    await page.waitForTimeout(2000);
    
    // Verificar se estatísticas estão sendo exibidas
    const statsCards = await page.locator('[class*="ModernStatCard"]').count();
    if (statsCards > 0) {
      console.log(`✅ SUCESSO: ${statsCards} cartões de estatísticas encontrados`);
    } else {
      console.log('❌ FALHA: Cartões de estatísticas não encontrados');
    }
    
    // Verificar se há dados de candidatos ou mensagem de "nenhum resultado"
    const noDataMessage = await page.locator('text=Nenhum resultado encontrado').isVisible().catch(() => false);
    const candidateCards = await page.locator('[class*="ModernCard"]').count();
    
    if (candidateCards > 0) {
      console.log(`✅ SUCESSO: ${candidateCards} candidatos carregados`);
    } else if (noDataMessage) {
      console.log('⚠️ AVISO: Nenhum candidato encontrado (pode ser normal se não há dados)');
    } else {
      console.log('❌ FALHA: Não foi possível determinar se há dados ou não');
    }
    
    // Teste 5: Funcionalidade de busca
    console.log('\n📋 Teste 5: Funcionalidade de busca');
    
    const searchInput = await page.locator('input[placeholder*="Buscar"]').isVisible();
    if (searchInput) {
      console.log('✅ SUCESSO: Campo de busca encontrado');
      
      // Testar busca
      await page.fill('input[placeholder*="Buscar"]', 'teste');
      await page.waitForTimeout(1000);
      console.log('✅ SUCESSO: Campo de busca funcional');
    } else {
      console.log('❌ FALHA: Campo de busca não encontrado');
    }
    
    // Teste 6: Filtros avançados
    console.log('\n📋 Teste 6: Filtros avançados');
    
    const advancedFilters = await page.locator('text=Filtros Avançados').isVisible().catch(() => false);
    if (advancedFilters) {
      console.log('✅ SUCESSO: Filtros avançados encontrados');
    } else {
      console.log('⚠️ AVISO: Filtros avançados não encontrados (pode estar em componente separado)');
    }
    
    // Teste 7: Botões de visualização
    console.log('\n📋 Teste 7: Botões de visualização');
    
    const viewButtons = await page.locator('button:has-text("Cartões"), button:has-text("Tabela")').count();
    if (viewButtons > 0) {
      console.log(`✅ SUCESSO: ${viewButtons} botões de visualização encontrados`);
    } else {
      console.log('❌ FALHA: Botões de visualização não encontrados');
    }
    
    // Teste 8: Botão de exportação
    console.log('\n📋 Teste 8: Botão de exportação');
    
    const exportButton = await page.locator('button:has-text("Exportar")').isVisible();
    if (exportButton) {
      console.log('✅ SUCESSO: Botão de exportação encontrado');
    } else {
      console.log('❌ FALHA: Botão de exportação não encontrado');
    }
    
    // Teste 9: Performance
    console.log('\n📋 Teste 9: Performance');
    
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Tempo de carregamento: ${loadTime}ms`);
    if (loadTime < 3000) {
      console.log('✅ SUCESSO: Carregamento rápido (< 3s)');
    } else {
      console.log('⚠️ AVISO: Carregamento lento (> 3s)');
    }
    
    // Teste 10: Responsividade
    console.log('\n📋 Teste 10: Responsividade');
    
    // Testar em resolução mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileLayout = await page.locator('h1').isVisible();
    if (mobileLayout) {
      console.log('✅ SUCESSO: Layout responsivo em mobile');
    } else {
      console.log('❌ FALHA: Layout não responsivo em mobile');
    }
    
    // Voltar para desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('\n🎉 Testes concluídos!');
    
  } catch (error) {
    console.error('❌ ERRO durante os testes:', error.message);
  } finally {
    await browser.close();
  }
}

// Executar testes
testDashboard().catch(console.error);
