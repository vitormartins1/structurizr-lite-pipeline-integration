# Structurizr Lite Puppeteer Integration Action

This **GitHub Action** enables the automatic export of diagrams from **Structurizr DSL** files in the repository. It integrates architectural diagram generation into the CI/CD pipeline, ensuring that visual representations are always up-to-date. The export is performed using Structurizr Lite as a service in GitHub Actions.

## Features

- Automatic export of diagrams from **Structurizr DSL** files in the repository.
- Support for output formats: `PNG` and `SVG`.
- Customizable output directory configuration.
- Export of primary diagrams and keys (metadata).
- Automatic commit of generated diagrams to the same branch.
- Compatible with repositories using `.dsl` files for diagram modeling.

## Usage

To use this Action, add the following workflow to your repository:

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
      - name: Adjust workspace permissions
        run: |
          sudo chmod -R u+rwx ${{ github.workspace }} || true
          sudo chown -R $USER:$USER ${{ github.workspace }} || true
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1
          clean: true
      - name: Copy workspace files to Structurizr Lite
        run: |
          CONTAINER_ID=$(docker ps --filter "name=structurizr" --format "{{.ID}}")
          docker cp ${{ github.workspace }}/docs/workspace.dsl $CONTAINER_ID:/usr/local/structurizr/workspace.dsl
          docker cp ${{ github.workspace }}/docs/styles.dsl $CONTAINER_ID:/usr/local/structurizr/styles.dsl
          docker cp ${{ github.workspace }}/docs/workspace.json $CONTAINER_ID:/usr/local/structurizr/workspace.json
          docker cp ${{ github.workspace }}/docs/.structurizr $CONTAINER_ID:/usr/local/structurizr/.structurizr
          CONTAINER_ID=$(docker ps --filter "name=structurizr" --format "{{.ID}}")
          docker exec $CONTAINER_ID ls -la /usr/local/structurizr/
      - name: Export Structurizr Diagrams
        uses: vitormartins1/structurizr-lite-puppeteer-integration-action@v1.0.1
        with:
          structurizr_url: 'http://localhost:8080/workspace/diagrams'
          format: 'png'
          output_dir: '${{ github.workspace }}/docs/diagrams/'
      - name: List Generated Diagrams
        run: ls -la ${{ github.workspace }}/docs/diagrams
      - name: Upload Diagrams
        uses: actions/upload-artifact@v4
        with:
          name: structurizr-diagrams
          path: ${{ github.workspace }}/docs/diagrams/
      - name: Commit Generated Diagrams
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

## Inputs

| Name             | Description                                         | Required |
|------------------|---------------------------------------------------|-------------|
| `structurizrUrl` | Structurizr Lite URL for export                   | Yes         |
| `format`         | Exported diagrams format (`PNG`/`SVG`)            | Yes         |
| `outputDir`      | Output directory where the diagrams will be saved | Yes         |

## Technical Details

1. The Action uses **Node.js** to export diagrams based on `.dsl` files and Structurizr Lite configurations contained in the `workspace.json` file and the `.structurizr` folder.
2. The generated diagrams are saved in the directory specified by the `outputDir` input variable.
3. After generation, the diagrams are automatically:
   - Made available as artifacts for download.
   - Committed back to the same repository branch.

## Configuring to Commit Diagrams

The **Commit Generated Diagrams** step is responsible for automatically committing the exported diagrams to the same branch in the repository. To ensure this step works correctly, you must configure the **GitHub Token** with appropriate permissions.

### How to Configure the GitHub Token

1. **Ensure Read and Write Permissions:**
   - Navigate to the repository's page on GitHub.
   - Go to the **Settings** tab.
   - In the sidebar, select **Actions** > **General**.
   - In the **Workflow permissions** section, select **Read and write permissions**.
   - Save changes by clicking **Save**.

2. **Use the Configured Token in the Workflow:**
   - GitHub automatically provides the `GITHUB_TOKEN` for the workflow.
   - This token is used in the **Commit Generated Diagrams** step to authenticate commit and push operations.

## Customization

You can extend or modify this Action to:

- Change the workflow triggering rules (`on.push`, `on.pull_request`, etc.).
- Add support for other output formats.
- Change the output directory.
- Combine it with other Actions.
- Exclude a specific branch (e.g., `main`).
    ```yaml
    on:
    push:
        paths:
            - 'docs/*.dsl'
            - 'docs/**/*.dsl'
        branches-ignore:
            - main
    ```
<!-- 
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

![alt](docs/diagrams/deploy-dev-key.png) -->

## Credits

This Action is based on the export approach described in the official [Structurizr Puppeteer](https://github.com/structurizr/puppeteer) repository. We thank the maintainers and contributors of this project for providing an efficient and reusable solution for diagram export.

https://github.com/structurizr/puppeteer

<!-- # structurizr-pipeline-integration
 
docker run --rm -p 8080:8080 -v "/Volumes/Transcend/structurizr-pipeline-integration/docs":/usr/local/structurizr structurizr/lite -->

