const core = require('@actions/core');
const exec = require('exec-sh').promise;

(async () => {
  try {
    // Inputs da Action
    const workspacePath = core.getInput('workspace_path');
    const outputPath = core.getInput('output_path');

    console.log(`Procurando arquivos .dsl modificados em: ${workspacePath}`);

    // Checar alterações no repositório
    const gitDiffCommand = `git diff --name-only HEAD~1 | grep '${workspacePath}.*\\.dsl$' || true`;
    const modifiedFiles = (await exec(gitDiffCommand, true)).stdout.trim().split('\n');

    if (modifiedFiles.length === 0 || modifiedFiles[0] === '') {
      console.log('Nenhum arquivo .dsl alterado. Finalizando a Action.');
      return;
    }

    console.log(`Arquivos modificados detectados: ${modifiedFiles.join(', ')}`);

    // Gerar diagramas para cada arquivo modificado
    for (const file of modifiedFiles) {
      if (file.trim()) {
        console.log(`Gerando diagramas para: ${file}`);
        const exportCommand = `./structurizr-cli/structurizr.sh export -w ${file} -f png -o ${outputPath}`;
        await exec(exportCommand, { stdio: 'inherit' });
      }
    }

    console.log('Exportação concluída.');
  } catch (error) {
    core.setFailed(`Erro durante a execução: ${error.message}`);
  }
})();