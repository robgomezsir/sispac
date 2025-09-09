// Script para debugar problemas de autenticação
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function debugAuth() {
  console.log('🔍 Debugando problemas de autenticação...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Interceptar logs do console
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Interceptar requisições de rede
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('auth') || request.url().includes('login')) {
        networkRequests.push(`REQUEST: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('auth') || response.url().includes('login')) {
        networkRequests.push(`RESPONSE: ${response.status()} ${response.url()}`);
      }
    });
    
    // Ir para página inicial
    console.log('📋 Acessando página inicial...');
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Verificar se há erros no console
    console.log('\n📋 Verificando logs do console...');
    const errorLogs = consoleLogs.filter(log => log.includes('[error]'));
    if (errorLogs.length > 0) {
      console.log('❌ ERROS encontrados:');
      errorLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('✅ Nenhum erro crítico no console');
    }
    
    // Tentar fazer login
    console.log('\n📋 Tentando fazer login...');
    
    // Preencher formulário
    await page.fill('input[type="email"]', 'admin@sispac.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar e verificar logs
    await page.waitForTimeout(5000);
    
    console.log('\n📋 Logs após tentativa de login:');
    const recentLogs = consoleLogs.slice(-10);
    recentLogs.forEach(log => console.log(`  ${log}`));
    
    console.log('\n📋 Requisições de rede:');
    networkRequests.forEach(req => console.log(`  ${req}`));
    
    // Verificar URL atual
    const currentUrl = page.url();
    console.log(`\n📋 URL atual: ${currentUrl}`);
    
    // Verificar se há mensagens de erro na página
    const errorElements = await page.locator('[class*="destructive"], [class*="error"]').all();
    if (errorElements.length > 0) {
      console.log('\n📋 Mensagens de erro na página:');
      for (const element of errorElements) {
        const text = await element.textContent();
        if (text) console.log(`  ${text}`);
      }
    }
    
    // Verificar se há elementos de loading
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"]').all();
    if (loadingElements.length > 0) {
      console.log('\n📋 Elementos de loading encontrados (pode estar travado)');
    }
    
    // Verificar se o formulário ainda está visível
    const formVisible = await page.locator('form').isVisible();
    if (formVisible) {
      console.log('\n📋 Formulário ainda visível - login não funcionou');
    } else {
      console.log('\n📋 Formulário não visível - possível redirecionamento');
    }
    
    // Tentar acessar dashboard diretamente
    console.log('\n📋 Tentando acessar dashboard diretamente...');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(3000);
    
    const dashboardUrl = page.url();
    console.log(`URL do dashboard: ${dashboardUrl}`);
    
    if (dashboardUrl.includes('/dashboard')) {
      console.log('❌ PROBLEMA: Dashboard acessível sem autenticação');
      
      // Verificar se há elementos do dashboard
      const dashboardTitle = await page.locator('h1').textContent().catch(() => null);
      console.log('Título do dashboard:', dashboardTitle);
      
      const refreshButton = await page.locator('button:has-text("Atualizar")').isVisible();
      console.log('Botão de atualizar visível:', refreshButton);
      
      if (refreshButton) {
        console.log('🔧 Testando carregamento de dados...');
        await page.click('button:has-text("Atualizar")');
        await page.waitForTimeout(3000);
        
        const statsCards = await page.locator('[class*="ModernStatCard"]').count();
        console.log(`Cartões de estatísticas: ${statsCards}`);
        
        const candidateCards = await page.locator('[class*="ModernCard"]').count();
        console.log(`Cartões de candidatos: ${candidateCards}`);
      }
    } else {
      console.log('✅ Dashboard protegido - redirecionamento funcionando');
    }
    
  } catch (error) {
    console.error('❌ ERRO durante debug:', error);
  } finally {
    await browser.close();
  }
}

debugAuth().catch(console.error);
