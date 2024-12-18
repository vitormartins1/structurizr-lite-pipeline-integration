const core = require('@actions/core');
const exec = require('exec-sh').promise;
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    // Inputs da Action
    const workspacePath = core.getInput('workspace_path'); // './docs'
    const outputPath = core.getInput('output_path'); // './docs/diagrams'
    const workspaceFile = path.join(workspacePath, 'workspace.dsl'); // Caminho do arquivo workspace.dsl

    console.log(`Procurando pelo arquivo workspace.dsl no diretório: ${workspacePath}`);

    // Verifica se o arquivo workspace.dsl existe
    if (!fs.existsSync(workspaceFile)) {
      console.log(`Arquivo workspace.dsl não encontrado em: ${workspaceFile}`);
      return;
    }

    console.log(`Arquivo encontrado: ${workspaceFile}`);

    // Caminho do Structurizr CLI
    const structurizrPath = path.resolve('./structurizr-cli/structurizr.sh');
    console.log(`Caminho do Structurizr CLI: ${structurizrPath}`);

    if (!fs.existsSync(structurizrPath)) {
      console.error(`Structurizr CLI não encontrado em: ${structurizrPath}`);
      return;
    }

    // Garantir permissão de execução
    await exec(`chmod +x ${structurizrPath}`);

    // Gera os diagramas a partir do arquivo workspace.dsl
    console.log(`Gerando diagramas para: ${workspaceFile}`);
    const exportCommand = `${structurizrPath} export -w ${workspaceFile} -f png -o ${outputPath}`;
    await exec(exportCommand, { stdio: 'inherit' });

    console.log('Exportação concluída com sucesso.');
  } catch (error) {
    core.setFailed(`Erro durante a execução: ${error.message}`);
  }
})();