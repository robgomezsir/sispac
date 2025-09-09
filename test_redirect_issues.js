import puppeteer from 'puppeteer';

async function testRedirectIssues() {
  console.log('🔍 Iniciando teste de problemas de redirecionamento...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  // Configurar logs do console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('❌ Console Error:', msg.text());
    } else if (msg.type() === 'warn') {
      console.warn('⚠️ Console Warning:', msg.text());
    } else {
      console.log('📝 Console Log:', msg.text());
    }
  });
  
  // Configurar logs de rede
  page.on('response', response => {
    if (!response.ok()) {
      console.error(`❌ Network Error: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // Teste 1: Acessar dashboard sem autenticação
    console.log('\n🧪 Teste 1: Acessando /dashboard sem autenticação...');
    await page.goto('http://localhost:5175/dashboard', { waitUntil: 'networkidle0' });
    
    const currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard')) {
      console.error('❌ FALHA: Dashboard acessível sem autenticação!');
    } else if (currentUrl.includes('/')) {
      console.log('✅ SUCESSO: Redirecionado para página inicial');
    }
    
    // Teste 2: Acessar configurações sem autenticação
    console.log('\n🧪 Teste 2: Acessando /config sem autenticação...');
    await page.goto('http://localhost:5175/config', { waitUntil: 'networkidle0' });
    
    const currentUrl2 = page.url();
    console.log(`📍 URL atual: ${currentUrl2}`);
    
    if (currentUrl2.includes('/config')) {
      console.error('❌ FALHA: Configurações acessíveis sem autenticação!');
    } else if (currentUrl2.includes('/')) {
      console.log('✅ SUCESSO: Redirecionado para página inicial');
    }
    
    // Teste 3: Acessar API sem autenticação
    console.log('\n🧪 Teste 3: Acessando /api sem autenticação...');
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0' });
    
    // Tentar navegar para /api via JavaScript
    await page.evaluate(() => {
      window.location.href = '/api';
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const currentUrl3 = page.url();
    console.log(`📍 URL atual: ${currentUrl3}`);
    
    if (currentUrl3.includes('/api')) {
      console.error('❌ FALHA: API acessível sem autenticação!');
    } else if (currentUrl3.includes('/')) {
      console.log('✅ SUCESSO: Redirecionado para página inicial');
    }
    
    // Teste 4: Fazer login e verificar redirecionamento
    console.log('\n🧪 Teste 4: Testando fluxo de login...');
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0' });
    
    // Preencher formulário de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@sispac.com');
    await page.type('input[type="password"]', 'admin123');
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento com timeout maior
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    } catch (error) {
      console.log('⚠️ AVISO: Timeout na navegação, verificando URL atual...');
    }
    
    const loginUrl = page.url();
    console.log(`📍 URL após login: ${loginUrl}`);
    
    if (loginUrl.includes('/dashboard')) {
      console.log('✅ SUCESSO: Login redirecionou para dashboard');
    } else {
      console.error('❌ FALHA: Login não redirecionou para dashboard');
    }
    
    // Teste 5: Navegar entre páginas protegidas
    console.log('\n🧪 Teste 5: Navegando entre páginas protegidas...');
    
    // Ir para configurações
    await page.goto('http://localhost:5175/config', { waitUntil: 'networkidle0' });
    const configUrl = page.url();
    console.log(`📍 URL configurações: ${configUrl}`);
    
    if (configUrl.includes('/config')) {
      console.log('✅ SUCESSO: Acesso a configurações funcionando');
    } else {
      console.error('❌ FALHA: Não conseguiu acessar configurações');
    }
    
    // Ir para API (deve falhar se não for admin)
    await page.goto('http://localhost:5175/api', { waitUntil: 'networkidle0' });
    const apiUrl = page.url();
    console.log(`📍 URL API: ${apiUrl}`);
    
    if (apiUrl.includes('/api')) {
      console.log('✅ SUCESSO: Acesso a API funcionando');
    } else {
      console.log('⚠️ AVISO: Acesso a API negado (esperado se não for admin)');
    }
    
    // Teste 6: Fazer logout e verificar redirecionamento
    console.log('\n🧪 Teste 6: Testando logout...');
    
    // Procurar botão de logout (pode estar em diferentes lugares)
    const logoutSelectors = [
      'button:contains("Sair")',
      'button:contains("Logout")',
      '[data-testid="logout"]',
      'button[aria-label*="logout" i]',
      'button[aria-label*="sair" i]'
    ];
    
    let logoutFound = false;
    for (const selector of logoutSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        logoutFound = true;
        break;
      } catch (e) {
        // Continuar tentando outros seletores
      }
    }
    
    if (!logoutFound) {
      console.log('⚠️ AVISO: Botão de logout não encontrado, tentando via console...');
      await page.evaluate(() => {
        // Tentar encontrar e clicar no botão de logout via JavaScript
        const buttons = Array.from(document.querySelectorAll('button'));
        const logoutBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('sair') || 
          btn.textContent.toLowerCase().includes('logout')
        );
        if (logoutBtn) {
          logoutBtn.click();
        }
      });
    }
    
    // Aguardar redirecionamento após logout
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    
    const logoutUrl = page.url();
    console.log(`📍 URL após logout: ${logoutUrl}`);
    
    if (logoutUrl.includes('/') && !logoutUrl.includes('/dashboard')) {
      console.log('✅ SUCESSO: Logout redirecionou para página inicial');
    } else {
      console.error('❌ FALHA: Logout não redirecionou corretamente');
    }
    
    // Teste 7: Tentar acessar página protegida após logout
    console.log('\n🧪 Teste 7: Tentando acessar página protegida após logout...');
    await page.goto('http://localhost:5175/dashboard', { waitUntil: 'networkidle0' });
    
    const finalUrl = page.url();
    console.log(`📍 URL final: ${finalUrl}`);
    
    if (finalUrl.includes('/dashboard')) {
      console.error('❌ FALHA: Dashboard ainda acessível após logout!');
    } else if (finalUrl.includes('/')) {
      console.log('✅ SUCESSO: Redirecionado para página inicial após logout');
    }
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await browser.close();
  }
}

// Executar os testes
testRedirectIssues().catch(console.error);
