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

    // Gera os diagramas a partir do arquivo workspace.dsl
    console.log(`Gerando diagramas para: ${workspaceFile}`);
    const exportCommand = `./structurizr-cli/structurizr.sh export -w ${workspaceFile} -f png -o ${outputPath}`;
    await exec(exportCommand, { stdio: 'inherit' });

    console.log('Exportação concluída com sucesso.');
  } catch (error) {
    core.setFailed(`Erro durante a execução: ${error.message}`);
  }
})();