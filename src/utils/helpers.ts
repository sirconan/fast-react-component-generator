import * as fs from "fs";
import * as vscode from "vscode";

// Basic validation of component name
export const validateComponentName = (componentName: string | null) => {
  if (!componentName || componentName === "") {
    return "The name can not be empty";
  }
  if (!componentName.match(/^(?:[a-z][a-z]*)(?:-[a-z]+)*$/)) {
    return "Use kebab-case string";
  }
  return null;
};

export const testFolderName = '__tests__';

export const pickOptions = {
  root: "Create folder, root component and index files",
  types: "Create types file",
  contants: "Create constants file",
  scssModules: "Create scss module styling file",
  panda: "Create panda styling file",
  hook: "Create hook file",
  tests: "Create __tests__ folder and file",
  //storybook: "Create storybook file",
};

export const optionsNeedComponentName = [pickOptions.root, pickOptions.hook, pickOptions.tests];

type IsOptions = {
  isScssModules?: boolean;
  isPanda?: boolean;
  componentName?: string;
};

export const generateClassName = ({ isScssModules, isPanda }: IsOptions) => {
  return isScssModules || isPanda ? ' className={styles.root}' : '';
};

export const generatePandaHook = (isPanda: boolean) => {
  return isPanda ? 'const styles = useStyles();' : '';
};

export const generateStyleExtension = ({ isScssModules, isPanda }: IsOptions) => {
  if (isScssModules) {
    return "module.scss";
  }

  if (isPanda) {
    return "ts";
  }

  return '';
};

export const generateStyleImport = ({
  isScssModules,
  isPanda,
}: IsOptions) => {
  const styleExtension = generateStyleExtension({ isScssModules, isPanda });
  if (isScssModules) {
    return `import styles from './styles.${styleExtension}'`;
  }
  
  if (isPanda) {
    return `import { useStyles } from './styles'`;
  }

  return '';
};

export const kebabToPascal = (inputString: string) => {
  return inputString.replace(/-([a-z])/g, (_, match) => match.toUpperCase()).replace(/^(.)/, (_, match) => match.toUpperCase());
};

export const hasCommonValue = (arr1: string[], arr2: string[]) => {
  return arr1.some(item => arr2.includes(item));
};

export const confirmOverride = async(path: string) => {
  const overrideIt = await vscode.window.showWarningMessage(`${path} already exist, do you want override it ?`, { modal: true }, { title: 'Yes' });
  return overrideIt?.title === 'Yes';
};

export const createFile = async(path: string, content: string) => {
  const exist = fs.existsSync(path);

  if (exist) {
    const allowOverride = await confirmOverride(path);
    if (!allowOverride) {
      return;
    }
  }

  fs.writeFileSync(
    path,
    content,
  );
};

export const createFolder = async(path: string) => {
  const exist = fs.existsSync( path );
  if (exist) {
    const allowOverride = await confirmOverride(path);
    if (!allowOverride) {
      throw new Error("Creation abort");
    }

    fs.rmSync(path, { recursive: true, force: true });
  }

  fs.mkdirSync(path);
};
