const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Cores para deixar o terminal bonito e amigável
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

console.log(`${colors.bright}${colors.blue}🚀 Iniciando processo de deploy automatizado...${colors.reset}\n`);

// 1. Validar variáveis de ambiente fundamentais
const requiredEnv = ["FTP_HOST", "FTP_USER", "FTP_PASSWORD"];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`${colors.bright}${colors.red}❌ Erro: Variáveis de ambiente ausentes no arquivo .env:${colors.reset}`);
  missingEnv.forEach(key => console.error(`   - ${key}`));
  console.log(`\n${colors.yellow}👉 Por favor, preencha as credenciais no arquivo .env criado na raiz do seu projeto.${colors.reset}\n`);
  process.exit(1);
}

const host = process.env.FTP_HOST;
const user = process.env.FTP_USER;
const password = process.env.FTP_PASSWORD;
const port = parseInt(process.env.FTP_PORT || "21", 10);
const remotePath = process.env.FTP_REMOTE_PATH || "public_html";

let secure = true;
if (process.env.FTP_SECURE === "false") {
  secure = false;
} else if (process.env.FTP_SECURE === "implicit") {
  secure = "implicit";
}

// Blacklist para ignorar no deploy de arquivos estáticos raiz
const blacklist = [
  "node_modules",
  ".git",
  ".github",
  ".vscode",
  ".idea",
  "scripts",
  ".env",
  ".env.example",
  "package.json",
  "package-lock.json",
  "implementation_plan.md",
  "task.md",
  "walkthrough.md",
  "LandingPage_VDR_Brief_Designer.pdf",
  ".gitignore"
];

// Diretório raiz e temporário
const rootDir = path.resolve(__dirname, "..");
const tempDirName = ".deploy_temp";
const tempDirPath = path.join(rootDir, tempDirName);

let sourceDir = "";
let isTemporary = false;

// 2. Detectar pasta de build ou arquivos estáticos
const standardBuildDirs = ["dist", "build", "out", "public"];
let detectedBuildDir = null;

for (const dir of standardBuildDirs) {
  const fullPath = path.join(rootDir, dir);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    detectedBuildDir = dir;
    break;
  }
}

if (detectedBuildDir) {
  sourceDir = path.join(rootDir, detectedBuildDir);
  console.log(`${colors.green}✔ Pasta de build detectada:${colors.reset} ${colors.bright}${detectedBuildDir}/${colors.reset}`);
} else {
  // Se não há pasta de build, criamos uma pasta temporária copiando apenas os arquivos estáticos relevantes
  console.log(`${colors.cyan}ℹ Nenhuma pasta de build padrão detectada. Preparando deploy de arquivos estáticos da raiz...${colors.reset}`);
  isTemporary = true;
  sourceDir = tempDirPath;

  try {
    if (fs.existsSync(tempDirPath)) {
      fs.rmSync(tempDirPath, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDirPath);

    const items = fs.readdirSync(rootDir);
    for (const item of items) {
      if (blacklist.includes(item) || item === tempDirName) {
        continue;
      }

      const itemPath = path.join(rootDir, item);
      const destPath = path.join(tempDirPath, item);

      if (fs.statSync(itemPath).isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyFolderSync(itemPath, destPath);
      } else {
        fs.copyFileSync(itemPath, destPath);
      }
    }
    console.log(`${colors.green}✔ Pasta temporária de deploy preparada com sucesso!${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}❌ Falha ao preparar pasta temporária de deploy: ${err.message}${colors.reset}`);
    cleanupTemp();
    process.exit(1);
  }
}

// Função auxiliar para copiar pastas recursivamente
function copyFolderSync(from, to) {
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      fs.mkdirSync(toPath, { recursive: true });
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

function cleanupTemp() {
  if (isTemporary && fs.existsSync(tempDirPath)) {
    console.log(`${colors.yellow}🧹 Limpando arquivos temporários locais...${colors.reset}`);
    fs.rmSync(tempDirPath, { recursive: true, force: true });
  }
}

// 3. Executar o deploy via FTP
async function runDeploy() {
  const client = new ftp.Client();
  // Aumentar o timeout para conexões lentas
  client.ftp.timeout = 60000;

  try {
    console.log(`${colors.cyan}🔄 Conectando ao servidor Hostinger (${host}:${port})...${colors.reset}`);
    await client.access({
      host,
      user,
      password,
      port,
      secure,
      secureOptions: {
        rejectUnauthorized: false
      }
    });

    console.log(`${colors.green}✔ Conectado com sucesso!${colors.reset}`);
    
    console.log(`${colors.cyan}📂 Acessando/Criando pasta remota: ${colors.reset}${colors.bright}${remotePath}${colors.reset}`);
    await client.ensureDir(remotePath);

    console.log(`${colors.cyan}⬆ Enviando arquivos para o servidor remoto... (isso pode levar alguns instantes)${colors.reset}`);
    
    // Mostra logs internos de progresso do basic-ftp de forma compacta
    client.ftp.verbose = false; // Mantenha false para logs customizados ou true para debug completo
    
    await client.uploadFromDir(sourceDir);

    console.log(`\n${colors.bright}${colors.green}🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🚀${colors.reset}`);
    console.log(`${colors.green}Seus arquivos foram enviados para a Hostinger no diretório "${remotePath}".${colors.reset}\n`);

  } catch (err) {
    console.error(`\n${colors.bright}${colors.red}❌ Erro durante o deploy via FTP:${colors.reset}`);
    console.error(`${colors.red}${err.stack || err.message}${colors.reset}\n`);
    console.log(`${colors.yellow}Dica de Solução:${colors.reset}`);
    console.log(`1. Verifique se seu Host, Usuário e Senha de FTP no arquivo .env estão corretos.`);
    console.log(`2. Certifique-se de que seu IP não está bloqueado pelo firewall da Hostinger.`);
    console.log(`3. Se a Hostinger não aceitar criptografia implícita na porta padrão, tente definir FTP_SECURE=false no arquivo .env.`);
    process.exit(1);
  } finally {
    client.close();
    cleanupTemp();
  }
}

runDeploy();
