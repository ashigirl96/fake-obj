import * as ts from "typescript";
import {Project, Type } from "ts-morph";
import * as process from "process";


const path = './examples/country.ts'

function generateFake(type: Type<ts.Type>) {
  if (type.isString()) {
    return "fuga"
  }
  if (type.isNumber()) {
    return 10
  }
  if (type.isBoolean()) {
    return true
  }
  return undefined
}

function main() {
  const project = new Project({})
  project.addSourceFileAtPath(path)
  const sourceFile = project.getSourceFile(path)
  if (!sourceFile)
    process.exit(1)
  const checker = project.getTypeChecker();
  const typeAlias = sourceFile.getTypeAliasOrThrow("Country")

  const visitType = (name: string, entryType: Type<ts.Type>, result: any) => {
    if (entryType.isNumber()) {
      result[name] = 10
    } else if (entryType.isString()) {
      result[name] = "fuga"
    } else if (entryType.isArray()) {
      const elementType = checker.getTypeArguments(entryType)[0];
      result[name] = [
        generateFake(elementType),
        generateFake(elementType),
        generateFake(elementType),
      ]
    } else if (entryType.isObject()) {
      for (const symbol of entryType.getProperties()) {
        const name = symbol.getName()
        const type = symbol.getTypeAtLocation(typeAlias)
        result[name] = visitType(name, type, {})
      }
    }
    return result
  }

  const result = visitType("Country", typeAlias.getType(), {})
  console.log(JSON.stringify(result, null, 2))
}

main()