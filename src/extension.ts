import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as mustache from "mustache";
import {
  templateComponent,
  templateIndex,
  templateStory,
  templateHook,
  templateType,
  templateConstant,
  templateTest,
  templateScss,
  templatePanda,
} from "./templates/react";
import {
  generateClassName,
  generateStyleExtension,
  generateStyleImport,
  pickOptions,
  validateComponentName,
  kebabToPascal,
  optionsNeedComponentName,
  hasCommonValue,
  generatePandaHook,
  testFolderName,
} from "./utils/helpers";

// Run on activation (when vscode loads)
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("fast-react-component-generator", execute)
  );
}

const createStructure = (fsPath: string, kebabName?: string, selectedItems?: string[]) => {
  if (typeof kebabName === "string") {
    const createRoot = !!selectedItems?.includes(pickOptions.root);

    const componentName = kebabToPascal(kebabName);
    const componentFolder = createRoot ? path.join(fsPath, kebabName) : path.join(fsPath);
    
    const isScssModules = !!selectedItems?.includes(
      pickOptions.scssModules
    );

    // Only one styling solution can be used, allow panda only when scss module is false
    const isPanda = !!selectedItems?.includes(
      pickOptions.panda
    ) && !isScssModules;

    const hasStorybook = false; //!!selectedItems?.includes(pickOptions.storybook);
    const hasTypes = !!selectedItems?.includes(pickOptions.types);
    const hasContants = !!selectedItems?.includes(pickOptions.contants);
    const hasTests = !!selectedItems?.includes(pickOptions.tests);
    const hasHook = !!selectedItems?.includes(pickOptions.hook);

    try {
      // Create a new folder
      if (createRoot) {
        const folderExist = fs.existsSync( componentFolder );
        if (folderExist) {
          throw new Error(`${kebabName} folder already exist`);
        }

        fs.mkdirSync(componentFolder);

        // Add main file
        fs.writeFileSync(
          path.join(componentFolder, `${kebabName}.tsx`),
          mustache.render(templateComponent, {
            componentName,
            styleImport: generateStyleImport({
              isScssModules, 
              isPanda,
            }),
            className: generateClassName({isScssModules, isPanda}),
            pandaHook: generatePandaHook(isPanda),
          })
        );

        // Add index file
        fs.writeFileSync(
          path.join(componentFolder, "index.ts"),
          mustache.render(templateIndex, { kebabName })
        );
      }

      if (hasTests) {
        const testsFolder = path.join(componentFolder, testFolderName);

        const folderExist = fs.existsSync( testsFolder );
        if (folderExist) {
          throw new Error(`${testFolderName} folder already exist in ${kebabName}`);
        }

        fs.mkdirSync(testsFolder);
        fs.writeFileSync(
          path.join(testsFolder, `${kebabName}.test.tsx`),
          mustache.render(templateTest, { componentName, kebabName })
        );
      }

      if (hasTypes) {
        // Add type file
        fs.writeFileSync(
          path.join(componentFolder, "types.ts"),
          mustache.render(templateType, { componentName })
        );
      }

      if (hasContants) {
        // Add constant file
        fs.writeFileSync(
          path.join(componentFolder, "contants.ts"),
          mustache.render(templateConstant, { componentName: componentName.toUpperCase() })
        );
      }

      if (hasHook) {
        // Add hook file
        fs.writeFileSync(
          path.join(componentFolder, `use-${kebabName}.ts`),
          mustache.render(templateHook, { componentName })
        );
      }

      if (isScssModules || isPanda) {
        // Add stylesheet
        fs.writeFileSync(
          path.join(
            componentFolder,
            `styles.${generateStyleExtension({
              isScssModules,
              isPanda,
            })}`
          ),
          mustache.render(isScssModules ? templateScss : templatePanda, {})
        );
      }

      // Add storybook
      if (hasStorybook) {
        fs.writeFileSync(
          path.join(componentFolder, `${kebabName}.stories.tsx`),
          mustache.render(templateStory, { componentName })
        );
      }

      // Open main file in editor
      // Add a 0.5-second delay to make sure files are created
      setTimeout(() => {
        vscode.workspace
          .openTextDocument(
            path.join(componentFolder, `${kebabName}.tsx`)
          )
          .then((document) => {
            vscode.window.showTextDocument(document);
          });
      }, 500);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Could not create the component. ${error}`
      );
    }
  }
};

// Run every time the command is executed
const execute = async ({ fsPath }: { fsPath: string }) => {
  const componentNameOptions: vscode.InputBoxOptions = {
    prompt: `Files will be created at ${fsPath} and existing files will be overwrite`,
    placeHolder: "Enter component name",
    validateInput: validateComponentName,
    ignoreFocusOut: true,
  };

  const selectedOption = await vscode.window.showQuickPick(Object.values(pickOptions), {
    canPickMany: true,
    placeHolder: "Select files to be included and press OK",
  });

  if (selectedOption &&  selectedOption.length > 0) {
    if (hasCommonValue(selectedOption, optionsNeedComponentName)) {
      const kebabName = await vscode.window.showInputBox(componentNameOptions);
      createStructure(fsPath, kebabName, selectedOption);
    } else {
      createStructure(fsPath, 'name', selectedOption);
    }
  }
};

// Clean up when deactivated
export function deactivate() {}
