# Structurizr Diagram Export Action

Esta **GitHub Action** permite exportar diagramas automaticamente a partir de arquivos **Structurizr DSL** no repositório. Ela integra a geração de diagramas arquiteturais ao fluxo de CI/CD, garantindo que as representações visuais estejam sempre atualizadas. A exportação é realizada utilizando o Structurizr Lite como serviço no GitHub Actions.

## Recursos

- Exportação automática de diagramas **Structurizr DSL** do repositório.
- Suporte a formatos de saída: `PNG` e `SVG`.
- Suporte a configuração de diretório de saída personalizado.
- Exportação de diagramas principais e de chaves (metadata).
- Commit automático dos diagramas gerados na mesma branch.
- Compatível com repositórios que utilizam arquivos `.dsl` para modelagem de diagramas.

## Como Usar

Para utilizar esta Action, adicione o seguinte workflow ao seu repositório:

```yaml
name: Structurizr Lite Export Workflow
on:
  push:
    paths:
      - 'docs/*.dsl'
      - 'docs/**/*.dsl' 
jobs:
  export-diagrams:
    runs-on: ubuntu-latest
    services:
      structurizr:
        image: structurizr/lite:latest
        ports:
          - 8080:8080
        options: --network-alias structurizr
    steps:
      - name: Ajustar permissões do workspace
        run: |
          sudo chmod -R u+rwx ${{ github.workspace }} || true
          sudo chown -R $USER:$USER ${{ github.workspace }} || true
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1
          clean: true
      - name: Copia arquivos do workspace para o Structurizr Lite
        run: |
          CONTAINER_ID=$(docker ps --filter "name=structurizr" --format "{{.ID}}")
          docker cp ${{ github.workspace }}/docs/workspace.dsl $CONTAINER_ID:/usr/local/structurizr/workspace.dsl
          docker cp ${{ github.workspace }}/docs/styles.dsl $CONTAINER_ID:/usr/local/structurizr/styles.dsl
          docker cp ${{ github.workspace }}/docs/workspace.json $CONTAINER_ID:/usr/local/structurizr/workspace.json
          docker cp ${{ github.workspace }}/docs/.structurizr $CONTAINER_ID:/usr/local/structurizr/.structurizr
          CONTAINER_ID=$(docker ps --filter "name=structurizr" --format "{{.ID}}")
          docker exec $CONTAINER_ID ls -la /usr/local/structurizr/
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Instalar dependências
        run: |
          cd .github/actions/structurizr-export
          npm install
      - name: Export Structurizr Diagrams
        uses: vitormartins1/structurizr-lite-pipeline-integration@v1
        with:
          structurizrUrl: 'http://localhost:8080/workspace/diagrams'
          format: 'png'
          outputDir: '${{ github.workspace }}/docs/diagrams/'
      - name: Listar Diagramas Gerados
        run: ls -la ${{ github.workspace }}/docs/diagrams
      - name: Upload de Diagramas
        uses: actions/upload-artifact@v4
        with:
          name: structurizr-diagrams
          path: ${{ github.workspace }}/docs/diagrams/
      - name: Comitar Diagramas Gerados
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/${{ github.repository }}
          cd ${{ github.workspace }}
          git add docs/diagrams/
          git commit -m "Atualizando diagramas gerados automaticamente"
          git push origin ${{ github.ref_name }}
```

## Entradas

| Nome             | Descrição                                         | Obrigatório |
|------------------|---------------------------------------------------|-------------|
| `structurizrUrl` | URL do Structurizr Lite para exportação           | Sim         |
| `format`         | Formato dos diagramas exportados (`PNG`/`SVG`)    | Sim         |
| `outputDir`      | Diretório de saída onde os diagramas serão salvos | Sim         |

## Detalhes Técnicos

1. A Action utiliza o **Node.js** para executar a exportação dos diagramas com base nos arquivos `.dsl` e configurações do Structurizr Lite contidas no arquivo `workspace.json` e na pasta `.structurizr`.
2. Os diagramas gerados são salvos no diretório especificado pela variável de entrada `outputDir`.
3. Após a geração, os diagramas são automaticamente:
   - Disponibilizados como artefatos para download.
   - Comitados de volta à mesma branch do repositório.

## Configuração para Comitar os Diagramas

O passo **Comitar Diagramas Gerados** é responsável por comitar automaticamente os diagramas exportados na mesma branch do repositório. Para que este passo funcione corretamente, é necessário configurar o **GitHub Token** com permissões adequadas.

### Como Configurar o GitHub Token

1. **Garantir Permissões de Leitura e Escrita:**
   - Vá para a página do repositório no GitHub.
   - Acesse a aba **Settings** (Configurações).
   - No menu lateral, selecione **Actions** > **General**.
   - Na seção **Workflow permissions**, selecione a opção **Read and write permissions**.
   - Salve as alterações clicando em **Save**.

2. **Utilizar o Token Configurado no Workflow:**
   - O GitHub automaticamente disponibiliza o token `GITHUB_TOKEN` para o workflow.
   - Este token é utilizado no passo **Comitar Diagramas Gerados** para autenticar as operações de commit e push.

## Personalização

Você pode estender ou modificar esta Action para:

- Alterar as regras de acionamento do workflow (`on.push`, `on.pull_request`, etc.).
- Adicionar suporte a outros formatos de saída.
- Alterar o diretório de saída.
- Executar em combinação com outras Actions.
- Excluir uma branch específica (Ex.: `main`)
    ```yaml
    on:
    push:
        paths:
            - 'docs/*.dsl'
            - 'docs/**/*.dsl'
        branches-ignore:
            - main
    ```

## Diagramas Gerados

Exemplo de diagramas gerados pela Action.

- **Diagrama de Container**

![alt](docs/diagrams/sns-com-sqs.png)

---

- **Key**

![alt](docs/diagrams/sns-com-sqs-key.png)

---

- **Diagrama de Deploy**

![alt](docs/diagrams/deploy-dev.png)

---

- **Key**

![alt](docs/diagrams/deploy-dev-key.png)

## Créditos

Esta Action utiliza como base a abordagem de exportação descrita no repositório oficial do [Structurizr Puppeteer](https://github.com/structurizr/puppeteer). Agradecemos aos mantenedores e colaboradores deste projeto por fornecerem uma solução eficiente e reutilizável para exportação de diagramas.

https://github.com/structurizr/puppeteer

## Licença

Este projeto está licenciado sob a licença **MIT**. Sinta-se livre para contribuir e reportar problemas via **Issues** no repositório.

<!-- # structurizr-pipeline-integration
 
docker run --rm -p 8080:8080 -v "/Volumes/Transcend/structurizr-pipeline-integration/docs":/usr/local/structurizr structurizr/lite -->

