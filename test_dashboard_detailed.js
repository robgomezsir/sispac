// Script de teste detalhado para o Dashboard SisPAC
// Execute com: node test_dashboard_detailed.js

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function testDashboardDetailed() {
  console.log('🚀 Iniciando testes detalhados do Dashboard SisPAC...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Teste 1: Verificar página inicial
    console.log('📋 Teste 1: Verificando página inicial');
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('URL atual:', currentUrl);
    
    // Verificar se há formulário de login
    const loginForm = await page.locator('form').isVisible();
    if (loginForm) {
      console.log('✅ SUCESSO: Formulário de login encontrado na página inicial');
    } else {
      console.log('❌ FALHA: Formulário de login não encontrado');
    }
    
    // Verificar se há campos de email e senha
    const emailInput = await page.locator('input[type="email"]').isVisible();
    const passwordInput = await page.locator('input[type="password"]').isVisible();
    
    if (emailInput && passwordInput) {
      console.log('✅ SUCESSO: Campos de email e senha encontrados');
    } else {
      console.log('❌ FALHA: Campos de login não encontrados');
    }
    
    // Teste 2: Tentar acessar dashboard sem login
    console.log('\n📋 Teste 2: Tentando acessar dashboard sem autenticação');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(3000);
    
    const dashboardUrl = page.url();
    console.log('URL após tentativa de acesso ao dashboard:', dashboardUrl);
    
    if (dashboardUrl.includes('/dashboard')) {
      console.log('❌ PROBLEMA: Dashboard acessível sem autenticação');
      
      // Verificar se há elementos do dashboard
      const dashboardTitle = await page.locator('h1').textContent().catch(() => null);
      console.log('Título encontrado:', dashboardTitle);
      
      if (dashboardTitle && dashboardTitle.includes('Candidatos')) {
        console.log('❌ PROBLEMA CRÍTICO: Dashboard carregou sem autenticação');
      }
    } else {
      console.log('✅ SUCESSO: Redirecionamento funcionando (dashboard não acessível sem login)');
    }
    
    // Teste 3: Verificar se há usuários de teste no banco
    console.log('\n📋 Teste 3: Verificando se há dados de teste');
    
    // Voltar para página inicial
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Tentar fazer login com credenciais de teste
    console.log('Tentando fazer login...');
    
    // Preencher formulário de login
    await page.fill('input[type="email"]', 'admin@sispac.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar resposta
    await page.waitForTimeout(5000);
    
    const afterLoginUrl = page.url();
    console.log('URL após tentativa de login:', afterLoginUrl);
    
    if (afterLoginUrl.includes('/dashboard')) {
      console.log('✅ SUCESSO: Login funcionou e redirecionou para dashboard');
      
      // Verificar elementos do dashboard
      const dashboardTitle = await page.locator('h1').textContent().catch(() => null);
      console.log('Título do dashboard:', dashboardTitle);
      
      // Verificar se há botão de atualizar
      const refreshButton = await page.locator('button:has-text("Atualizar")').isVisible();
      if (refreshButton) {
        console.log('✅ SUCESSO: Botão de atualizar encontrado');
        
        // Clicar no botão de atualizar
        console.log('Clicando no botão de atualizar...');
        await page.click('button:has-text("Atualizar")');
        await page.waitForTimeout(3000);
        
        // Verificar se há dados carregados
        const statsCards = await page.locator('[class*="ModernStatCard"]').count();
        console.log(`Cartões de estatísticas encontrados: ${statsCards}`);
        
        const candidateCards = await page.locator('[class*="ModernCard"]').count();
        console.log(`Cartões de candidatos encontrados: ${candidateCards}`);
        
        if (statsCards > 0) {
          console.log('✅ SUCESSO: Estatísticas carregadas');
        } else {
          console.log('⚠️ AVISO: Nenhuma estatística encontrada');
        }
        
        if (candidateCards > 0) {
          console.log('✅ SUCESSO: Candidatos carregados');
        } else {
          console.log('⚠️ AVISO: Nenhum candidato encontrado (pode ser normal se não há dados)');
        }
        
      } else {
        console.log('❌ FALHA: Botão de atualizar não encontrado');
      }
      
    } else {
      console.log('❌ FALHA: Login não funcionou ou não redirecionou');
      
      // Verificar se há mensagem de erro
      const errorMessage = await page.locator('[class*="destructive"]').textContent().catch(() => null);
      if (errorMessage) {
        console.log('Mensagem de erro:', errorMessage);
      }
    }
    
    // Teste 4: Verificar console para erros
    console.log('\n📋 Teste 4: Verificando erros no console');
    
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(`ERRO: ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleLogs.length > 0) {
      console.log('❌ ERROS encontrados no console:');
      consoleLogs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('✅ SUCESSO: Nenhum erro crítico no console');
    }
    
    console.log('\n🎉 Testes detalhados concluídos!');
    
  } catch (error) {
    console.error('❌ ERRO durante os testes:', error.message);
  } finally {
    await browser.close();
  }
}

// Executar testes
testDashboardDetailed().catch(console.error);
